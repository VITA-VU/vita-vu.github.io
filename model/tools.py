import json
from pathlib import Path
import numpy as np
import pandas as pd
from typing import Any, Dict, Iterable, List
import random

# Assuming that all programs have already been embedded to generate interest and skill vectors
# and that these vectors are available to be picked up 
# require a tool that can fetch the correct embeddings when called

# RIASEC axes
AXES = ["R", "I", "A", "S", "E", "C"]

# Helper functions for microtasks fetching and stopping point functions

def _l1(v: np.ndarray) -> np.ndarray:
    """
    L1 normalize vector to sum to 1.0 (convert to probability distribution).
    
    Example: [1, 2, 3] → [0.167, 0.333, 0.5] (sum=1.0)
    Edge case: If sum=0, return uniform distribution [1/n, 1/n, ...]
    """
    s = float(v.sum())
    return v / s if s > 0 else np.ones_like(v) / len(v)

def _entropy(s: np.ndarray) -> float:
    """
    Shannon entropy: measures uncertainty/spread of probability distribution. We treat the student vector [0.2, 0.3, 0.1, 0.15, 0.15, 0.1] as ONE probability distribution over 6 categories (R, I, A, S, E, C).
    
    High entropy (≈1.79 for 6 axes) = uniform, uncertain profile
    Low entropy (≈0.0) = concentrated, confident profile
    
    Formula: H = -Σ(p_i * log(p_i))
    Range: [0, log(6)] = [0, 1.79] for RIASEC
    
    NOTE: Only uses CURRENT vector, no history needed. We are interested in how spread out is the distribution RIGHT NOW.
    """
    s = _l1(s)  # Ensure normalized
    eps = 1e-12  # Prevent log(0)
    return float(-(s * np.log(np.clip(s, eps, 1.0))).sum())

def _top2_gap(s: np.ndarray) -> float:
    """
    Gap between top-1 and top-2 RIASEC components.
    
    Large gap (>0.15) = clear winner, confident profile
    Small gap (<0.12) = top two are close, need disambiguation
    
    Example: [0.05, 0.65, 0.10, 0.05, 0.10, 0.05]
             → top2 = [0.10, 0.65] → gap = 0.55
    
    NOTE: Only uses CURRENT vector, no history needed.
    """
    s = _l1(s)  # Ensure normalized
    top2 = np.sort(s)[-2:]  # Get two largest values
    return float(top2[1] - top2[0])  # top1 - top2

# Load microtask bank once at module import
# Use absolute path based on project root to avoid working directory issues
_PROJECT_ROOT = Path(__file__).parent.parent
_MICROTASKS_PATH = _PROJECT_ROOT / "data" / "microtasks_new.json"
with open(_MICROTASKS_PATH, "r", encoding="utf-8") as f:
    MICROTASK_BANK = json.load(f)

RIASEC_dict = {0: 'R', 1: 'I', 2: 'A', 3: 'S', 4: 'E', 5:'C'}
step = 0.01

test_data = pd.read_csv("data/processed/program_vectors.csv")
test_data["vector"] = test_data["vector"].str.split('[').str[1]
test_data["vector"] = test_data["vector"].str.split(']').str[0]
test_data["vector"] = test_data["vector"].str.split(",")


class Tools:

    def __init__(self, RIASEC_dict=None, step=None, all_programs=None):
        self.program_vectors = pd.DataFrame(columns=['program', 'vector'])
        self.student_vector = np.ones(6) / np.sqrt(6)  # Initialize to uniform distribution
        self.all_student_vectors = [] # to hold the history of all student vectors so far
        # Use module-level defaults if not provided
        self.RIASEC_dict = RIASEC_dict if RIASEC_dict is not None else globals()['RIASEC_dict']
        self.step = step if step is not None else globals()['step']
        self.all_programs = all_programs if all_programs is not None else test_data
        self.epsilon = 10e-6
        

    def eligible_programs(self, hs_profile: str) -> list[str]:
        """
        Returns a list of all eligible programs based on HS profile.
        
        TODO: Implement actual filtering logic based on hs_profile.
        For now, return all programs present in the program vectors data.
        """
        program_data = pd.read_csv("data/processed/program_vectors.csv")

        programs = program_data["program"].unique().tolist()

        self.programs_set = programs

        return self.programs_set


        
    def get_avatar_embedding(self):
        """
        get the normalized embedding based on chosen self.avatar
        """
        
        # TODO: remove hardcoded vector and retreive correct vector based on avatar
        # currently initialized as a trivially normalized vector
        self.student_vector = [0.4082, 0.4082, 0.4082, 0.4082, 0.4082, 0.4082]
    

    def fetch_program_vector(self, program):
        all_programs = self.all_programs.copy()
        index = all_programs.loc[all_programs["program"] == program].index
        vector = self.all_programs.iloc[index]["vector"]
        
        return vector

    def initiate_student_vectors(self, avatar_chosen=None, demo=None):
        """
        initiate student vectors based on avatar and demo information
        
        If avatar_chosen and demo are None, initializes to uniform distribution (API compatibility)
        """
        if avatar_chosen is None or demo is None:
            # Simple initialization for API compatibility
            self.student_vector = np.ones(6) / np.sqrt(6)
            self.start_student_vector = self.student_vector.copy()
            return
        
        self.avatar = avatar_chosen
        self.get_avatar_embedding()
        self.start_student_vector = self.student_vector
        self.all_student_vectors.append(self.student_vector)

        self.eligible_programs(demo["hs_profile"])

        gradient = np.zeros((len(self.programs_set), 6))


        for program in self.programs_set:
            program_vector = self.fetch_program_vector(program)
            i = self.programs_set.index(program)

            for j in range(0, 6):
                gradient[i, j] = program_vector.iloc[0][j]

            vector_dict = {
            "program": program, 
            "vector": program_vector
            }

            vector_df = pd.DataFrame(vector_dict)

            self.program_vectors = pd.concat([self.program_vectors, vector_df], ignore_index=True)

        self.gradient = gradient


        #TODO: how to iniate weights of these vectors
        self.program_vectors["weights"] = 0
        self.program_vectors["task_order"] = 0
        self.program_vectors["asked"] = 0 
        

        

    def RIASEC_test(self, student_choice, scaling_factor=0.15):
        """
        Initiate program order based on student's choice in the RIASEC test.
        Finds out which personality component is the maximum and arranges program vectors based on that.
        Finally updates the student vector based on chosen RIASEC profile.
        
        Returns:
            dict | None: Next microtask if not at stopping point, None otherwise
        """

        # start with the (ranked list) student_choice ['R': 2, 'I': 5, 'A': 3, 'S': 1, 'E': 6, 'C': 4]

        RIASEC = ['R', 'I', 'A', 'S', 'E', 'C']

        student_choice_dict = {}

        for val in RIASEC:
            student_choice_dict[val] = student_choice.index(val) + 1
        
        ranked_list = list(student_choice_dict.values())
        
        first_preference = ranked_list.index(1)
        second_preference = ranked_list.index(2)
        third_preference = ranked_list.index(3)
        fourth_preference = ranked_list.index(4)
        fifth_preference = ranked_list.index(5)
        sixth_preference = ranked_list.index(6)

        first_preference_RIASEC = RIASEC[first_preference]
        second_preference_RIASEC = RIASEC[second_preference]
        
        
        for i, row in self.program_vectors.iterrows():
            
            max_value = max(row["vector"])

            if row["vector"].index(max_value ) == first_preference:
                self.program_vectors.loc[i, "task_order"] = 1
            elif row["vector"].index(max_value ) == second_preference:
                self.program_vectors.loc[i, "task_order"] = 2 
            elif row["vector"].index(max_value ) == third_preference:
                self.program_vectors.loc[i, "task_order"] = 3 
            elif row["vector"].index(max_value ) == fourth_preference:
                self.program_vectors.loc[i, "task_order"] = 4 
            elif row["vector"].index(max_value ) == fifth_preference:
                self.program_vectors.loc[i, "task_order"] = 5
            else:
                self.program_vectors[i, "task_order"] = 6         

       
        return self.update_student_vectors(task_answer=int(first_preference), scaling_factor=scaling_factor)

            
    def fetch_microtask(
        self,
        student_vector,
        program: str,
        verify_gap_threshold: float = 0.12,
        rng: np.random.Generator | None = None
    ) -> dict:
        """
        Fetch microtask from bank based on student profile clarity.
        
        Strategy:
    
        - Small gap between top-2 axes (uniformity) → broad exploration (6 options)
        - Large gap between top-2 axes (concentration) → targeted disambiguation (3 options)
        
        Args:
            student_vector: 6D RIASEC vector (R, I, A, S, E, C)
            program: Program name (e.g., "Mathematics", "Nursing")
            verify_gap_threshold: Gap threshold for broad vs targeted (default: 0.12)
            rng: Random number generator for task selection (default: seeded RNG)
        
        Returns:
            dict: Microtask with 'question', 'options', and 'meta' fields
        """
        if rng is None:
            rng = np.random.default_rng(42)
        
        # Normalize student vector
        s = _l1(np.asarray(student_vector, dtype=float))
        
        # Top-1 vs Top-2
        order = np.argsort(-s)
        top_idx, second_idx = order[0], order[1]
        gap = float(s[top_idx] - s[second_idx])
        
        prog_pool = MICROTASK_BANK.get(program, {})
        # generic_pool = MICROTASK_BANK.get("_generic_", {})
        
        # Decide: broad exploration or targeted disambiguation
        if gap < verify_gap_threshold:
            # High uncertainty → use broad tasks
            candidates = prog_pool.get("broad", [])
            # + generic_pool.get("broad", [])
            policy = "broad_exploration"
            target_axes = ["all"]
        else:
            # Low uncertainty → disambiguate top1 vs top2
            target_axes = [AXES[top_idx], AXES[second_idx]]
            policy = "disambiguate_top2"
            candidates = []
            for axis in target_axes:
                candidates += prog_pool.get(axis, [])
                # candidates += generic_pool.get(axis, [])
        
        # return prog_pool, candidates, program
        # Select random task from candidates
        task = rng.choice(candidates)
        
        # Add metadata for debugging/analytics. "meta" is a dictionary that stores diagnostic information about why this task was selected
        task.setdefault("meta", {})  # Ensure "meta" dict exists. 
        task["meta"].update({
            "policy": policy,           # "broad_exploration" or "disambiguate_top2"
            "target_axes": target_axes, # Which RIASEC axes this task targets
            "top2_gap": gap,            # Gap between top-1 and top-2 (decision metric)
            "entropy": _entropy(s),     # Current profile uncertainty
        })
        return task


    def normalize(self):
        norm = np.linalg.norm(self.student_vector)
        self.student_vector = self.student_vector/norm

    def update_student_vectors(self, task_answer, task_preference = None, program = None, scaling_factor = 0.15):
        """
        Update student vectors based on their responses to microtask.
        
        Returns:
            dict | None: Next microtask if not at stopping point, None otherwise
        """

        profile_preference = self.RIASEC_dict[task_answer]
        importance_vector = self.gradient[:, task_answer]
        importance_vector_norm = np.linalg.norm(importance_vector)

        if program is not None:
            program_vector = self.program_vectors[self.program_vectors["program"] == program]["vector"]
            # program_vector = program_vector.iloc[0]
            program_vector_component = program_vector.iloc[0][task_answer]
        else:
            profile_preference = None

        # vector updation
        #TODO: tune the scaling_factor
        if profile_preference is not None:
            self.student_vector[task_answer] = \
                            self.student_vector[task_answer] + scaling_factor*float(program_vector_component) /float(importance_vector_norm + self.epsilon) 
        else: # updation in the case of RIASEC test answers
            self.student_vector[task_answer] = self.student_vector[task_answer] + scaling_factor/float(importance_vector_norm + self.epsilon)

        
        self.normalize()
        self.all_student_vectors.append(self.student_vector)
        
        
        # micro-task order updation
        if task_preference is not None:
            if program is not None:
                if task_preference == "positive":
                    self.program_vectors.loc[self.program_vectors['program'] == program, "task_order"] = \
                    max(0, self.program_vectors.loc[self.program_vectors['program'] == program,"task_order"].item() - 1)
                elif task_preference == "negative":
                    self.program_vectors.loc[self.program_vectors['program'] == program, "task_order"] = \
                    min(6, self.program_vectors.loc[self.program_vectors['program'] == program, "task_order"].item() + 1)



        if self.check_stopping_point():
            return self.recommend_programs()
        else:
            # filter out programs that have not yet been asked
            #TODO: check when we ask across unasked questions (broad) and when we narrow down to specific asked tasks
            if 0 in self.program_vectors["asked"].unique():
                programs = self.program_vectors.loc[self.program_vectors["asked"] == 0]
                
                min_task_order = programs["task_order"].min()
                # filter out programs that has lowest task order (highest student preference)
                programs = programs.loc[(programs["task_order"] == min_task_order)]["program"].unique()
                
                # Randomly choose a program having the lowest task order and update the programs_vector
                program = random.choice(list(programs))
                
                self.program_vectors.loc[self.program_vectors["program"] == program, "asked"] = 1
                
                
                #fetch the microtask for the chosen program
                return self.fetch_microtask(program=program, student_vector=self.student_vector)
            else:
                min_task_order = self.program_vectors["task_order"].min()
                # filter out programs that has lowest task order (highest student preference)
                programs = self.program_vectors.loc[(programs["task_order"] == min_task_order)]["program"].unique()

                # Randomly choose a program having the lowest task order and update the programs_vector
                program = random.choice(list(programs))
                self.program_vectors.loc[self.program_vectors["program"] == program, "asked"] = 1

                
                #fetch the microtask for the chosen program
                return self.fetch_microtask(program=program, student_vector=self.student_vector)    
            
            
    def check_stopping_point(
        self,
        entropy_threshold: float = 1.20,
        gap_threshold: float = 0.15
    ) -> bool:
        """
        Check if student profiling has reached stopping point.
        
        Stops when profile is confident (OR logic):
        - Shannon entropy < threshold (concentrated profile)
        - Top-1 vs top-2 gap > threshold (clear dominant axis)
        
        Args:
            student_vector: 6D RIASEC vector (R, I, A, S, E, C)
            entropy_threshold: Max entropy to stop profiling (default: 1.20)
            gap_threshold: Min gap between top-2 to stop (default: 0.15)
        
        Returns:
            bool: True if profiling should stop, False to continue
        """
        s = _l1(np.asarray(self.student_vector, dtype=float))
        return (_entropy(s) < entropy_threshold) or (_top2_gap(s) > gap_threshold)


    def recommend_programs(self):
        """
        Find 3 nearest neighbors to the student vector from the program set
        Return an ordered list of dictionaries
        {'program', 'recommendation_order', 'explanation'}
        explanation consists of if the student enjoyed the microtask presented for this program, 
        which student personlities have increased with tasks has evolved with the microtasks
        """

        self.program_vectors["distance"] = 0
        self.program_vectors["distance_vector"] = self.program_vectors["vector"]
        for i, row in self.program_vectors.iterrows():
            program_vector = [float(a) for a in row["vector"]]
            distance_vector = np.asarray(program_vector) - np.asarray(self.student_vector)
            distance = np.linalg.norm(distance_vector)
            self.program_vectors["distance"][i] = distance
            self.program_vectors["distance_vector"][i] = distance_vector
        
        distances = self.program_vectors.copy()
        distances["least_distance"] = distances["distance_vector"].apply(lambda x: min(x))
        distances["least_distance_index"] = distances["distance_vector"].apply(lambda x: np.argmin(x))
        distances["highest_profile"] = distances["least_distance_index"].apply(lambda x: RIASEC_dict[x])

        distances.sort_values("distance",inplace=True)

        first_program = {
            "program":distances.loc[0, "program"],
            "least_distance": round(distances.loc[0, "least_distance"],4),
            "highest_profile": distances.loc[0, "highest_profile"]
            }
        second_program = {
            "program":distances.loc[1, "program"],
            "least_distance": round(distances.loc[1, "least_distance"],4),
            "highest_profile": distances.loc[1, "highest_profile"]
            }
        third_program = {
            "program":distances.loc[2, "program"],
            "least_distance": round(distances.loc[2, "least_distance"],4),
            "highest_profile": distances.loc[2, "highest_profile"]
            }

        return [first_program, second_program, third_program]

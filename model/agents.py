"""
AI agent for dynamic RIASEC microtask generation.

Integrates with Tools.fetch_microtask() to generate tasks on-demand when:
- No unused tasks exist in microtasks.json bank
- New programs need tasks
- Specific RIASEC axis combinations are needed

Uses Pydantic AI + Gemini 2.0 Flash for structured output generation.
"""



from pydantic import BaseModel, Field, field_validator
from pydantic_ai import Agent
from pydantic_ai.exceptions import ModelRetry
from typing import Literal

from typing import Union
from uuid import uuid4

# ============================================================================
# Pydantic Schemas
# ============================================================================
#  RIASEC preference microtasks

class TaskOption(BaseModel):
    """Single option in a microtask."""
    text: str = Field(..., min_length=10, max_length=200)
    riasec: Literal["R", "I", "A", "S", "E", "C"]


class Microtask(BaseModel):
    """Generated microtask matching microtasks.json structure."""
    question: str = Field(..., min_length=20, max_length=300)
    options: dict[Literal["A", "B", "C", "D", "E", "F"], TaskOption]
    
    @field_validator('options')
    @classmethod
    def validate_option_count(cls, v):
        """Validate that we have either 3 or 6 options."""
        if len(v) not in (3, 6):
            raise ValueError(f"Must have 3 or 6 options, got {len(v)}")
        return v



# ============================================================================
# Generator Agent
# ============================================================================

generator = Agent[
    None,  # No dependencies
    Microtask
](
    model='google-vertex:gemini-2.0-flash-exp',  # Using Vertex AI with Gemini 2.0 Flash
    output_type=Microtask,
    system_prompt='''
                You are a RIASEC microtask generator for university program profiling for HIGH SCHOOL STUDENTS (ages 16-17).

                TARGET AUDIENCE: 16-17 year old students choosing university programs. Use language and scenarios they can relate to.

                RIASEC Framework:
                - R (Realistic): Hands-on, practical work, using tools, building things
                - I (Investigative): Research, analysis, understanding theories, problem-solving
                - A (Artistic): Creative expression, design, visual work, unconventional approaches
                - S (Social): Helping others, teaching, teamwork, supporting classmates
                - C (Conventional): Organizing, following procedures, systematic approaches, managing details

                Task Requirements:
                1. Question tests PREFERENCE, not knowledge ("What appeals to you?" not "What is X?")
                2. Options are distinct and clearly map to different RIASEC axes
                3. For "broad" policy: 6 options (A-F) covering all RIASEC axes
                4. For targeted policy (R/I/A/S/E/C): 3 options (A-C) disambiguating axes
                5. Use AGE-APPROPRIATE scenarios: school projects, classmates, study groups, NOT professional work
                6. Match the tone and style of existing examples in the microtask bank

                EXAMPLES OF GOOD OPTIONS (age-appropriate):
                - "Help classmates understand concepts" (S) ✓
                - "Leading study groups and projects" (E) ✓
                - "Build physical models or use calculators" (R) ✓
                - "Research new mathematical theories" (I) ✓

                EXAMPLES OF BAD OPTIONS (too professional):
                - "Leading software development teams" ✗
                - "Managing corporate databases" ✗
                - "Coordinating project timelines in industry" ✗
                '''
)


@generator.output_validator
def validate_task_quality(ctx, output: Microtask) -> Microtask:
    """Quality checks before accepting generated task."""
    riasec_axes = [opt.riasec for opt in output.options.values()]
    
    # Check 1: All options have unique RIASEC axes
    if len(riasec_axes) != len(set(riasec_axes)):
        raise ModelRetry("Options must have distinct RIASEC axes")
    
    # Check 2: Question doesn't contain knowledge-testing keywords
    bad_keywords = ["what is", "define", "calculate", "solve"]
    if any(kw in output.question.lower() for kw in bad_keywords):
        raise ModelRetry("Question tests knowledge, not preference. Rephrase.")
    
    return output


# ============================================================================
# Generation Function
# ============================================================================

def generate_microtask(
    program: str,
    policy: str,
    target_axes: list[str] | None = None
) -> dict:
    """
    Generate single microtask. Returns dict matching microtasks.json format.
    
    Args:
        program: Program name (e.g., "Mathematics")
        policy: "broad" or single axis ("R", "I", "A", "S", "E", "C")
        target_axes: For disambiguate_top2, the [top1, top2] axes to include in options
    
    Returns:
        dict: Microtask with 'question' and 'options' fields
    """
    # Build prompt based on policy
    if target_axes and len(target_axes) == 2:
        # Disambiguate top-2: options MUST include both axes
        prompt = f"""Generate a RIASEC microtask for {program} program for 16-17 year old high school students.

                    Policy: {policy}
                    
                    Use age-appropriate language and scenarios that high school students can relate to.
                    Focus on: school projects, classmates, study groups, learning activities, course preferences.
                    
                    CRITICAL: The 3 options (A, B, C) MUST include:
                    - One option with riasec="{target_axes[0]}" (top-1 axis)
                    - One option with riasec="{target_axes[1]}" (top-2 axis)
                    - One option with a different RIASEC axis (to provide contrast)

                    This task is for disambiguating between {target_axes[0]} and {target_axes[1]}.

                    Use age-appropriate language: school projects, classmates, study groups, learning activities.
                    Example: "Help classmates understand concepts" NOT "Lead professional teams"."""
    else:
        # Broad or single-axis task
        prompt = f"""Generate a RIASEC microtask for {program} program for 16-17 year old high school students.

                    Policy: {policy}

                    CRITICAL: The question and ALL options must be SPECIFIC to {program}. 
                    - Mention {program}-related activities, concepts, or scenarios
                    - Use terminology and examples relevant to {program}
                    - Make it clear this is about {program}, not a generic field
                    
                    Use age-appropriate language and scenarios that high school students can relate to.
                    Focus on: school projects, classmates, study groups, learning activities, course preferences.

                    Example structure (adapt to {program}):
                    - "Help classmates understand [program-specific concept]" (Social)
                    - "Leading study groups on [program topic]" (Enterprising)
                    - "Build/use [program-specific tools]" (Realistic)
                    - "Research [program-specific theories]" (Investigative)"""
    
    # Generate task
    result = generator.run_sync(prompt)
    task = result.output.model_dump()
    
    # Validate: For disambiguate_top2, ensure both target axes are present
    if target_axes and len(target_axes) == 2:
        option_axes = [opt["riasec"] for opt in task["options"].values()]
        if target_axes[0] not in option_axes or target_axes[1] not in option_axes:
            raise ValueError(
                f"Generated task missing required axes {target_axes}. Got: {option_axes}"
            )
    
    return task


# ============================================================================
# Aptitude micro challenges
# ============================================================================

TaskType = Literal["puzzle", "classify", "codeorder", "fillblank", "graph"]


class BaseAptitudeTask(BaseModel):
    """Shared fields for all aptitude micro challenges."""
    type: TaskType
    question: str = Field(..., min_length=10, max_length=400)
    tiny_learn: list[str] = Field(..., min_length=3, max_length=3)
    hint: str = Field(..., min_length=5, max_length=300)

    @field_validator("tiny_learn")
    @classmethod
    def validate_tiny_learn(cls, v):
        """We always want three short bullets in tiny_learn."""
        if len(v) != 3:
            raise ValueError("tiny_learn must contain exactly three bullet points")
        return v


class PuzzleTask(BaseAptitudeTask):
    type: Literal["puzzle"] = "puzzle"
    puzzle: dict
    options: list[dict]
    correctAnswer: str


class ClassifyTask(BaseAptitudeTask):
    type: Literal["classify"] = "classify"
    categories: list[str]
    items: list[dict]


class CodeOrderTask(BaseAptitudeTask):
    type: Literal["codeorder"] = "codeorder"
    language: str
    description: str
    lines: list[dict]  # here each dict has id, code, correctPosition
    expectedOutput: str


class FillBlankTask(BaseAptitudeTask):
    type: Literal["fillblank"] = "fillblank"
    textWithBlanks: str  # here we use markers like "{{0}}" and "{{1}}"
    blanks: list[dict]   # here each dict has id and correctWordId
    words: list[dict]    # here each dict has id and text


class GraphTask(BaseAptitudeTask):
    type: Literal["graph"] = "graph"
    graphData: dict      # here we store type, title, labels, values and similar fields
    clickableRegions: list[dict]
    correctRegion: str


AptitudeTask = Union[PuzzleTask, ClassifyTask, CodeOrderTask, FillBlankTask, GraphTask]



aptitude_generator = Agent[
    None,
    AptitudeTask
](
    model="google-vertex:gemini-2.0-flash-exp",
    output_type=AptitudeTask,
    system_prompt="""
        You generate aptitude micro challenges for high school students for a playful study choice tool.
        The question should feel like a first step in a real course task.
        who are exploring different bachelor programmes.

        General goals:
        1. Tasks test ability or reasoning, not preference.
        2. Difficulty should be around the level of the final years of secondary school.
        3. Tasks should feel like doing a tiny piece of work from the programme domain.
        4. Each task must include a clear correct answer and a short helpful hint.
        5. tiny_learn must contain exactly three short bullet points that explain the idea.

        Task types:

        puzzle:
            A short logic or pattern puzzle.
            You fill puzzle, options, correctAnswer.

        classify:
            Students sort items into categories.
            You fill categories and items.
            Each item has id, text and correctCategory.

        codeorder:
            Students reorder code lines to achieve a simple behaviour.
            You fill language, description, lines and expectedOutput.
            Each line has id, code and correctPosition.

        fillblank:
            Students complete a short text by choosing the right words.
            You fill textWithBlanks with markers such as {{0}},
            blanks and words so that each blank points to a word id.

        graph:
            Students read a small graph and select the correct region.
            You fill graphData, clickableRegions and correctRegion.

        Never ask what students prefer or enjoy.
        Use imperative instructions such as choose, select, arrange.
    """,
)

@aptitude_generator.output_validator
def validate_aptitude_task(ctx, output: AptitudeTask) -> AptitudeTask:
    """Quality checks for aptitude tasks before accepting them."""
    # Here we run shared checks
    if not output.question.strip():
        raise ModelRetry("Question must not be empty")

    if not output.hint.strip():
        raise ModelRetry("Hint must not be empty")

    # Here we run type specific checks
    if isinstance(output, PuzzleTask):
        ids = [opt.get("id") for opt in output.options if isinstance(opt, dict)]
        if not ids:
            raise ModelRetry("Puzzle options must include option ids")
        if output.correctAnswer not in ids:
            raise ModelRetry("correctAnswer must match one of the option ids")

    elif isinstance(output, ClassifyTask):
        if len(output.categories) < 2:
            raise ModelRetry("Classify task must have at least two categories")
        cat_set = set(output.categories)
        if not output.items:
            raise ModelRetry("Classify task must have at least one item")
        for item in output.items:
            cat = item.get("correctCategory")
            if cat not in cat_set:
                raise ModelRetry(
                    "Each classify item must have correctCategory in categories list"
                )

    elif isinstance(output, CodeOrderTask):
        if not output.lines:
            raise ModelRetry("Codeorder task must have at least one line")
        positions = []
        for line in output.lines:
            pos = line.get("correctPosition")
            if not isinstance(pos, int):
                raise ModelRetry("Each code line must have integer correctPosition")
            positions.append(pos)
        # Here we allow zero based or one based, but values must be unique
        if len(positions) != len(set(positions)):
            raise ModelRetry("correctPosition values must be unique for all lines")
        if not output.expectedOutput.strip():
            raise ModelRetry("Codeorder task must include expectedOutput text")

    elif isinstance(output, FillBlankTask):
        if "{{" not in output.textWithBlanks or "}}" not in output.textWithBlanks:
            raise ModelRetry("textWithBlanks must contain at least one {{index}} marker")
        word_ids = {w.get("id") for w in output.words}
        if not output.blanks:
            raise ModelRetry("Fillblank task must define blanks")
        for blank in output.blanks:
            cw = blank.get("correctWordId")
            if cw not in word_ids:
                raise ModelRetry(
                    "Each blank must have correctWordId that appears in words list"
                )

    elif isinstance(output, GraphTask):
        region_ids = {
            r.get("id") for r in output.clickableRegions if isinstance(r, dict)
        }
        if not region_ids:
            raise ModelRetry("Graph task must define clickableRegions with ids")
        if output.correctRegion not in region_ids:
            raise ModelRetry(
                "correctRegion must be one of the clickableRegions ids"
            )

    # Here we block preference language in aptitude questions
    bad_words = ["prefer", "would rather", "enjoy more"]
    lower_q = output.question.lower()
    if any(w in lower_q for w in bad_words):
        raise ModelRetry("Aptitude tasks must not ask about preferences")

    return output


def generate_aptitude_task(program: str, task_type: TaskType) -> dict:
    """
    Generate one aptitude micro challenge for a programme.

    Args:
        program: programme name, for example Archaeology.
        task_type: one of puzzle, classify, codeorder, fillblank, graph.

    Returns:
        dict with the same shape as aptitude entries in microtasks_bank.json,
        plus signalType and question_code fields so it can be appended to the bank.
    """
    type_specific = {
        "puzzle": """
            Create a short logic or pattern puzzle that could plausibly
            appear in an introductory course in this programme.
            Use options with simple ids such as A B C D.
            Set correctAnswer to one of these ids.
        """,
        "classify": """
            Create a classify task where the student assigns each item
            to one of the categories.
            Use categories as a list of strings.
            Each item must be a dict with id, text and correctCategory
            that matches one of the categories.
        """,
        "codeorder": """
            Create a codeorder task where lines of code are shuffled.
            Use language to name the language, usually python.
            Use lines as dicts with id, code and correctPosition as an integer index.
            expectedOutput shows what the programme prints when lines are in order.
        """,
        "fillblank": """
            Create a fillblank task where the student chooses the right words
            to complete a short explanation or process.
            Use textWithBlanks with markers {{0}}, {{1}} and so on.
            blanks is a list of dict with id and correctWordId.
            words is a list of dict with id and text for the answer options.
        """,
        "graph": """
            Create a graph task where the student reads a small graph about
            a concept from the programme.
            graphData holds a simple line or bar graph with labels and values.
            clickableRegions is a list of dict with id and label for the user choices.
            correctRegion is one of these ids.
        """,
    }

    base_prompt = f"""
        Generate one {task_type} aptitude micro challenge for the bachelor programme {program}.

        Difficulty:
        High school student who is curious and motivated but not yet an expert.

        Content:
        Base the task on a realistic concept or activity from {program}.
        It must be solvable using reasoning from the prompt or standard school level knowledge.
        Never require specialised university knowledge.

        Structure:
        Follow the Pydantic model for task_type {task_type}.
        Always fill tiny_learn with exactly three short bullet points.
        Always fill hint with a short nudge that does not give the answer away.

        Important:
        Do not talk about preferences or what the student likes.
        Use clear and concise wording.
    """

    prompt = base_prompt + type_specific[task_type]

    result = aptitude_generator.run_sync(prompt)
    task_dict = result.output.model_dump()

    # Here we attach envelope fields used in the bank
    task_dict["signalType"] = "aptitude"
    task_dict["program"] = program
    task_dict["question_code"] = f"{program[:3].lower()}-{task_type}-{uuid4().hex[:6]}"

    return task_dict









# ============================================================================
# Integration Notes
# ============================================================================
# This module is imported by model/tools.py:
#   from model.agents import generate_microtask
#
# Called in Tools.fetch_microtask() when:
#   1. No unused tasks in bank (lines 168-176)
#   2. No valid disambiguate tasks (lines 200-208)
#

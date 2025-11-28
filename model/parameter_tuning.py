import numpy as np
import pandas as pd

from tools import Tools

import warnings
warnings.filterwarnings("ignore")



"""
Creates a diagnostics file to assess scaling factors for different choices of start vectors.

Conclusion: As long as we make use of normalized program vectors and student vectors at each stage,
a scaling factor of 1 should not lead to an aggressive updation in the vectors.
Based on the diagnostic csv, changes in the vector component that get affected are ~ 0.07

"""






N = 30  # how many vectors
vectors = np.random.rand(N, 6)
vectors = vectors / np.linalg.norm(vectors, axis=1, keepdims=True)
vectors = np.round(vectors, 5)


stored = vectors.copy()
print(stored)


diagnostics = pd.DataFrame(columns=["start_student_vector", "student_choice", "RIASEC_test_student_vector","RIASEC_test_output", "task_answer", "task_preference", "program", "scaling_factor", "updated_vector"])
for i in range(0,N): 
    for num in np.linspace(0, 1, 20): 
        try:
            virtual_open_day = Tools()

            demo = {"age": 17, "hs_profile": "N&T"}
            virtual_open_day.initiate_student_vectors(avatar_chosen="griffeon_cooking", demo=demo)
            
            virtual_open_day.student_vector = stored[i].copy()
            start_student_vector = virtual_open_day.student_vector.copy()
            
            
            student_choice = ["S","I","A","E","R","C"]
            RIASEC_test_output = virtual_open_day.RIASEC_test(student_choice=student_choice, scaling_factor=num).copy()
            
            RIASEC_test_student_vector = virtual_open_day.student_vector.copy()


            task_answer = 2
            task_preference = "positive"
            program = "Mathematics"
            scaling_factor = num
           
            val = virtual_open_day.update_student_vectors(task_answer=task_answer, task_preference=task_preference, program=program, scaling_factor=scaling_factor)

            updated_student_vector = virtual_open_day.student_vector.copy()
    
            
            row = {"start_student_vector": str(start_student_vector), 
                    "student_choice": student_choice[0],
                    "RIASEC_test_student_vector": str(RIASEC_test_student_vector),
                    "RIASEC_test_output": RIASEC_test_output,
                    "task_answer": task_answer, 
                    "task_preference": task_preference, 
                    "program": program, 
                    "scaling_factor":scaling_factor, 
                    "updated_vector": str(updated_student_vector)

            }
            
            to_add = pd.DataFrame([row])
            

            diagnostics = pd.concat([diagnostics, to_add], ignore_index=True)
           

            
        except:
            continue


diagnostics.to_csv("diagnostics_and_pipeline/diagnostics.csv")







# Aptitude Task Agent Specification

## Goal
Extend `model/agents.py` to generate aptitude tasks (puzzle, classify, codeorder, fillblank, graph) in addition to existing personality MCQ tasks.

---

## Schema Changes

### New Pydantic Models (add to `agents.py`)

```python
# Task type determines structure
TaskType = Literal["puzzle", "classify", "codeorder", "fillblank", "graph"]

class PuzzleTask(BaseModel):
    type: Literal["puzzle"] = "puzzle"
    question: str
    puzzle: dict  # {variant: "balance"|"pattern", ...}
    options: list[dict]  # [{id, value}, ...]
    correctAnswer: str  # option id
    hint: str

class ClassifyTask(BaseModel):
    type: Literal["classify"] = "classify"
    question: str
    categories: list[str]
    items: list[dict]  # [{id, text, correctCategory}, ...]
    hint: str

class CodeOrderTask(BaseModel):
    type: Literal["codeorder"] = "codeorder"
    question: str
    language: str
    description: str
    lines: list[dict]  # [{id, code, correctPosition}, ...]
    expectedOutput: str
    hint: str

class FillBlankTask(BaseModel):
    type: Literal["fillblank"] = "fillblank"
    question: str
    textWithBlanks: str  # "The {{0}} is {{1}}"
    blanks: list[dict]  # [{id, correctWordId}, ...]
    words: list[dict]  # [{id, text}, ...]
    hint: str

class GraphTask(BaseModel):
    type: Literal["graph"] = "graph"
    question: str
    graphData: dict  # {type, title, labels, values, ...}
    clickableRegions: list[dict]
    correctRegion: str
    hint: str
```

---

## New Agent

```python
aptitude_generator = Agent[None, PuzzleTask | ClassifyTask | CodeOrderTask | FillBlankTask | GraphTask](
    model='google-vertex:gemini-2.0-flash-exp',
    system_prompt='''
    You generate aptitude tasks for university program profiling.
    
    Task types:
    - puzzle: Balance equations or pattern completion
    - classify: Sort items into categories
    - codeorder: Arrange code lines correctly
    - fillblank: Fill missing words in text
    - graph: Identify data points on charts
    
    Requirements:
    - Tasks test ABILITY, not preference
    - Include correctAnswer/correctCategory/correctPosition
    - Difficulty: high school level (ages 16-17)
    - Include helpful hint
    '''
)
```

---

## Generation Function

```python
def generate_aptitude_task(
    program: str,
    task_type: TaskType
) -> dict:
    """Generate aptitude task for program."""
    prompt = f"""Generate a {task_type} task for {program}.
    Difficulty: high school level.
    Must include correct answer and hint."""
    
    result = aptitude_generator.run_sync(prompt)
    task = result.output.model_dump()
    task["signalType"] = "aptitude"
    task["program"] = program
    task["question_code"] = f"{program[:3].lower()}-{task_type}-{uuid4().hex[:6]}"
    return task
```

---

## Integration with `tools.py`

In `fetch_microtask()`, when aptitude is selected but pool is empty:

```python
if available_aptitude == 0 and should_serve_aptitude:
    new_task = generate_aptitude_task(program, random.choice(["puzzle", "classify", "graph"]))
    MICROTASK_BANK[program]["aptitude"].append(new_task)
    return new_task
```

---

## Files to Modify

| File | Change |
|------|--------|
| `model/agents.py` | Add schemas + `aptitude_generator` + `generate_aptitude_task()` |
| `model/tools.py` | Import and call `generate_aptitude_task()` when aptitude pool empty |

# Aptitude Tasks Integration Plan

## Goal
Integrate aptitude tasks (graph, fillblank, puzzle) into the main frontend flow. Currently the main flow only supports MCQ personality tasks. The API already returns different task types based on entropy - we just need the frontend to render them.

---

## Already Done

- **`requests.tsx`** - Added code to store meta info (entropy, aptProb, policy, signalType, taskType) from API response to localStorage
- **`TaskScreen.tsx`** - Added debug panel that displays entropy, aptProb, policy, signalType, student vector bars, and stop status from localStorage

---

## Changes Required

### 1. `requests.tsx` - Handle all task types in `returnTask()`

**Why:** Currently `returnTask()` assumes every task has an `options` object in MCQ format. Aptitude tasks (graph, fillblank, puzzle) have different structures. We need to handle both cases.

**Where:** In the `returnTask()` function, around line 131.

**What to change:** Replace the existing `if (t !== null...)` block with:
```typescript
if (t !== null && t !== undefined) {
  // Store raw task for reference
  localStorage.setItem('currentTask', JSON.stringify(t));
  
  // Only transform options if it's an MCQ with object-style options
  if (t.options && typeof t.options === 'object' && !Array.isArray(t.options)) {
    t.options = Object.entries(t.options).map(([key, val]) => ({
      key, text: val.text, riasec: val.riasec
    }));
  }
  
  localStorage.setItem('currentProgram', t.program || '');
  setTask(t);
}
```

---

### 2. `TaskScreen.tsx` - Use MicrotaskRenderer instead of TaskCard

**Why:** `TaskCard` only renders MCQ tasks. `MicrotaskRenderer` can render all task types (mcq, graph, fillblank, puzzle). It's already built and working in the demo.

**Where:** In `TaskScreen.tsx`, replace the `<TaskCard ... />` component.

**What to do:**

1. Add import at top of file:
```typescript
import { MicrotaskRenderer } from '../microtasks/MicrotaskRenderer';
```

2. Replace the `<TaskCard ... />` section with:
```typescript
<MicrotaskRenderer 
  task={task} 
  onComplete={(result) => {
    localStorage.setItem('answer', result.answer ?? '');
    localStorage.setItem('isCorrect', String(result.isCorrect ?? ''));
    localStorage.setItem('signalType', task.signalType ?? 'personality');
    onComplete();
  }} 
  onSkip={() => {
    localStorage.setItem('taskAnswered', 'false');
    onComplete();
  }}
/>
```

---

### 3. `App.tsx` - Update task type in context

**Why:** The `task` in AppContext is typed as `TaskCardProps` which is specific to MCQ tasks. We need to allow any task shape to pass through.

**Where:** In `App.tsx`, around line 48 in the `AppContextType` interface.

**What to change:**
```typescript
// Change from:
task?: TaskCardProps | null;
setTask: (task: TaskCardProps | null) => void;

// To:
task?: any;
setTask: (task: any) => void;
```

---

## Testing

After making these changes:
1. Run the app and go through the normal flow
2. Verify personality MCQ tasks still work as before
3. Continue until entropy drops and aptitude tasks appear
4. Verify graph/fillblank/puzzle tasks render and are interactive
5. Verify the "Did you enjoy?" preference still works
6. Verify stopping condition triggers the recommendations screen

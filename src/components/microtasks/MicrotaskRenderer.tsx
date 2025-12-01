// MicrotaskRenderer - Dynamic router for all task types
// Routes to the appropriate task component based on task.type

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Microtask, TaskResult } from './types';

// Import all task components
import { MCQTask } from './tasks/MCQTask';
import { RankingTask } from './tasks/RankingTask';
import { ClassifyTask } from './tasks/ClassifyTask';
import { ScenarioTask } from './tasks/ScenarioTask';
import { GraphTask } from './tasks/GraphTask';
import { PuzzleTask } from './tasks/PuzzleTask';
import { FillBlankTask } from './tasks/FillBlankTask';
import { CodeOrderTask } from './tasks/CodeOrderTask';

const TASK_COMPONENTS = {
  'mcq': MCQTask,
  'ranking': RankingTask,
  'classify': ClassifyTask,
  'scenario': ScenarioTask,
  'graph': GraphTask,
  'puzzle': PuzzleTask,
  'fillblank': FillBlankTask,
  'codeorder': CodeOrderTask,
} as const;

interface MicrotaskRendererProps {
  task: Microtask;
  onComplete: (result: TaskResult) => void;
  onSkip: () => void;
}

export function MicrotaskRenderer({ task, onComplete, onSkip }: MicrotaskRendererProps) {
  const TaskComponent = TASK_COMPONENTS[task.type];

  if (!TaskComponent) {
    console.error(`Unknown task type: ${task.type}, falling back to MCQ`);
    return <MCQTask task={task as any} onComplete={onComplete} onSkip={onSkip} />;
  }

  return (
    <AnimatePresence mode="wait">
      <TaskComponent
        key={task.question_code}
        task={task as any}
        onComplete={onComplete}
        onSkip={onSkip}
      />
    </AnimatePresence>
  );
}

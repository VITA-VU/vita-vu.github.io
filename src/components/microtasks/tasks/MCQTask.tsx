// MCQ Task Component
// Supports both preference (no correct answer) and performance (has correct answer) modes

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TaskShell } from '../common/TaskShell';
import { optionSelect, correctAnswer, incorrectAnswer, staggerChildren, staggerItem } from '../animations';
import type { MCQTask as MCQTaskType, TaskComponentProps, TaskResult } from '../types';

export function MCQTask({ task, onComplete, onSkip }: TaskComponentProps<MCQTaskType>) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [startTime] = useState(Date.now());

  const handleSelect = (optionId: string) => {
    if (feedback) return; // Don't allow changes after submission
    setSelectedId(optionId);
  };

  const handleNext = () => {
    if (!selectedId) return;

    const selectedOption = task.options.find((o) => o.id === selectedId);
    if (!selectedOption) return;

    // Check if this is a performance task (has correct answers)
    const hasCorrectAnswer = task.options.some((o) => o.isCorrect);
    
    if (hasCorrectAnswer && task.signalType === 'performance') {
      // Show feedback for performance tasks
      const isCorrect = selectedOption.isCorrect === true;
      setFeedback(isCorrect ? 'correct' : 'incorrect');
      
      // Delay completion to show feedback
      setTimeout(() => {
        const result: TaskResult = {
          taskId: task.question_code,
          taskType: 'mcq',
          signalType: task.signalType,
          selectedRiasec: selectedOption.riasec,
          isCorrect,
          timeSpent: Date.now() - startTime,
          hintsUsed: false,
        };
        onComplete(result);
      }, 1000);
    } else {
      // Preference task - no feedback, just complete
      const result: TaskResult = {
        taskId: task.question_code,
        taskType: 'mcq',
        signalType: task.signalType,
        selectedRiasec: selectedOption.riasec,
        isCorrect: null,
        timeSpent: Date.now() - startTime,
        hintsUsed: false,
      };
      onComplete(result);
    }
  };

  return (
    <TaskShell
      question={task.question}
      hint={task.hint}
      learnBullets={task.learnBullets}
      onNext={handleNext}
      onSkip={onSkip}
      canSubmit={selectedId !== null && !feedback}
      showFeedback={feedback}
    >
      {/* Stimulus */}
      {task.stimulus && (
        <div className="mb-6">
          <h4 className="text-[1.125rem] font-medium mb-2">{task.stimulus.title}</h4>
          <p className="text-[1rem] text-gray-700 leading-relaxed">{task.stimulus.body}</p>
        </div>
      )}

      {/* Options */}
      <motion.div
        variants={staggerChildren}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        {task.options.map((option, index) => {
          const isSelected = selectedId === option.id;
          const showCorrect = feedback && option.isCorrect;
          const showIncorrect = feedback === 'incorrect' && isSelected && !option.isCorrect;

          return (
            <motion.label
              key={option.id}
              variants={staggerItem}
              animate={
                showCorrect ? 'correct' : showIncorrect ? 'incorrect' : isSelected ? 'selected' : 'idle'
              }
              whileHover={!feedback ? 'hover' : undefined}
              className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all min-h-[44px] ${
                isSelected && !feedback
                  ? 'border-vita-gold bg-amber-50'
                  : showCorrect
                  ? 'border-green-500 bg-green-50'
                  : showIncorrect
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleSelect(option.id)}
            >
              <input
                type="radio"
                name="mcq-option"
                checked={isSelected}
                onChange={() => handleSelect(option.id)}
                className="mt-0.5 accent-vita-gold"
                disabled={!!feedback}
              />
              <span className="text-[1rem] flex-1">
                <span className="mr-2 font-medium">{String.fromCharCode(65 + index)}.</span>
                {option.text}
              </span>
            </motion.label>
          );
        })}
      </motion.div>
    </TaskShell>
  );
}

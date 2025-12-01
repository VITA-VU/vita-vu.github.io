// Scenario Task Component
// Story-based preference task with character and situation

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TaskShell } from '../common/TaskShell';
import { staggerChildren, staggerItem, scaleIn } from '../animations';
import type { ScenarioTask as ScenarioTaskType, TaskComponentProps, TaskResult } from '../types';

export function ScenarioTask({ task, onComplete, onSkip }: TaskComponentProps<ScenarioTaskType>) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  const handleSelect = (optionId: string) => {
    setSelectedId(optionId);
  };

  const handleNext = () => {
    if (!selectedId) return;

    const selectedOption = task.options.find((o) => o.id === selectedId);
    if (!selectedOption) return;

    const result: TaskResult = {
      taskId: task.question_code,
      taskType: 'scenario',
      signalType: task.signalType,
      selectedRiasec: selectedOption.riasec,
      isCorrect: null, // Scenario is preference-based
      timeSpent: Date.now() - startTime,
      hintsUsed: false,
    };
    onComplete(result);
  };

  return (
    <TaskShell
      question={task.question}
      hint={task.hint}
      onNext={handleNext}
      onSkip={onSkip}
      canSubmit={selectedId !== null}
    >
      {/* Scenario Card */}
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6"
      >
        {/* Character */}
        {task.character && (
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{task.character.emoji}</span>
            <span className="text-[0.875rem] font-medium text-blue-900">
              {task.character.name}
            </span>
          </div>
        )}

        {/* Scenario Text */}
        <p className="text-[1rem] text-gray-800 leading-relaxed">
          {task.scenario}
        </p>
      </motion.div>

      {/* Response Options */}
      <motion.div
        variants={staggerChildren}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        {task.options.map((option, index) => {
          const isSelected = selectedId === option.id;

          return (
            <motion.label
              key={option.id}
              variants={staggerItem}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all min-h-[44px] ${
                isSelected
                  ? 'border-vita-gold bg-amber-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
              onClick={() => handleSelect(option.id)}
            >
              <input
                type="radio"
                name="scenario-option"
                checked={isSelected}
                onChange={() => handleSelect(option.id)}
                className="mt-1 accent-vita-gold"
              />
              <span className="text-[1rem] flex-1">
                {option.text}
              </span>
            </motion.label>
          );
        })}
      </motion.div>

      <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
        <p className="text-[0.875rem] text-purple-900">
          💭 There's no right or wrong answer — choose what feels most natural to you.
        </p>
      </div>
    </TaskShell>
  );
}

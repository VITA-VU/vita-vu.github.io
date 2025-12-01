// Ranking Task Component
// Drag-to-reorder items to reveal preference ordering

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { TaskShell } from '../common/TaskShell';
import { useDragReorder } from '../hooks/useDragReorder';
import { dragItem, staggerChildren, staggerItem } from '../animations';
import type { RankingTask as RankingTaskType, TaskComponentProps, TaskResult, RIASECAxis } from '../types';

export function RankingTask({ task, onComplete, onSkip }: TaskComponentProps<RankingTaskType>) {
  const { items, draggedId, handleDragStart, handleDragOver, handleDragEnd, moveUp, moveDown } = 
    useDragReorder(task.items);
  const [startTime] = useState(Date.now());

  const handleNext = () => {
    // Calculate RIASEC scores based on ordering
    // Top items get more weight (6 for first, 5 for second, etc.)
    const scores: Record<RIASECAxis, number> = {
      R: 0, I: 0, A: 0, S: 0, E: 0, C: 0
    };

    items.forEach((item, index) => {
      const points = items.length - index;
      scores[item.riasec] += points;
    });

    // Get the top-ranked RIASEC axis
    const topAxis = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([letter]) => letter as RIASECAxis)[0];

    const result: TaskResult = {
      taskId: task.question_code,
      taskType: 'ranking',
      signalType: task.signalType,
      selectedRiasec: topAxis,
      isCorrect: null, // Ranking is preference-based, no correct answer
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
      canSubmit={true}
    >
      <div className="mb-4">
        <p className="text-[0.875rem] text-gray-600">
          Drag items to reorder from most appealing (top) to least appealing (bottom)
        </p>
      </div>

      <motion.div
        variants={staggerChildren}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            variants={staggerItem}
            draggable
            onDragStart={() => handleDragStart(item.id)}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDragEnd={handleDragEnd}
            animate={draggedId === item.id ? 'dragging' : 'idle'}
            className={`bg-white border-2 rounded-lg p-4 transition-all ${
              draggedId === item.id
                ? 'border-vita-gold shadow-lg opacity-50'
                : 'border-gray-200 hover:border-vita-gold/50 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Drag handle + position number */}
              <div className="flex-shrink-0 flex items-center gap-2 cursor-move">
                <GripVertical size={20} className="text-gray-400" />
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-vita-gold/10 text-vita-gold text-[0.875rem] font-medium">
                  {index + 1}
                </div>
              </div>

              {/* Item text */}
              <p className="flex-1 text-[1rem] text-gray-900 pt-1">
                {item.text}
              </p>

              {/* Mobile up/down buttons */}
              <div className="flex-shrink-0 flex flex-col gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveUp(item.id);
                  }}
                  disabled={index === 0}
                  className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Move up"
                >
                  <ChevronUp size={20} className="text-gray-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveDown(item.id);
                  }}
                  disabled={index === items.length - 1}
                  className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Move down"
                >
                  <ChevronDown size={20} className="text-gray-600" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-[0.875rem] text-blue-900">
          💡 <strong>Tip:</strong> Drag items or use the arrows to reorder them.
        </p>
      </div>
    </TaskShell>
  );
}

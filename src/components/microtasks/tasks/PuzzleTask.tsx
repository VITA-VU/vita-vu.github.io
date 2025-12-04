// Puzzle Task Component
// Visual logic puzzles - balance scale or pattern completion

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TaskShell } from '../common/TaskShell';
import { staggerChildren, staggerItem } from '../animations';
import type { PuzzleTask as PuzzleTaskType, TaskComponentProps, TaskResult, BalancePuzzle, PatternPuzzle } from '../types';

export function PuzzleTask({ task, onComplete, onSkip }: TaskComponentProps<PuzzleTaskType>) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [startTime] = useState(Date.now());

  const handleSelect = (optionId: string) => {
    if (feedback) return;
    setSelectedId(optionId);
  };

  const handleNext = () => {
    if (!selectedId) return;

    const isCorrect = selectedId === task.correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    const selectedOption = task.options.find((o) => o.id === selectedId);

    setTimeout(() => {
      const result: TaskResult = {
        taskId: task.question_code,
        taskType: 'puzzle',
        signalType: task.signalType,
        selectedRiasec: selectedOption?.riasec || null,
        isCorrect,
        timeSpent: Date.now() - startTime,
        hintsUsed: false,
      };
      onComplete(result);
    }, 1000);
  };

  const isBalancePuzzle = task.puzzle.variant === 'balance';
  const isPatternPuzzle = task.puzzle.variant === 'pattern';

  return (
    <TaskShell
      question={task.question}
      hint={task.hint}
      onNext={handleNext}
      onSkip={onSkip}
      canSubmit={selectedId !== null && !feedback}
      showFeedback={feedback}
      isGenerated={task.meta?.generated}
    >
      {/* Balance Puzzle */}
      {isBalancePuzzle && <BalancePuzzleVisual puzzle={task.puzzle as BalancePuzzle} />}

      {/* Pattern Puzzle */}
      {isPatternPuzzle && <PatternPuzzleVisual puzzle={task.puzzle as PatternPuzzle} />}

      {/* Answer Options */}
      <motion.div
        variants={staggerChildren}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6"
      >
        {task.options.map((option) => {
          const isSelected = selectedId === option.id;
          const isCorrectOption = feedback && option.id === task.correctAnswer;
          const isIncorrectOption = feedback === 'incorrect' && isSelected;

          return (
            <motion.button
              key={option.id}
              variants={staggerItem}
              onClick={() => handleSelect(option.id)}
              disabled={!!feedback}
              className={`p-4 border-2 rounded-lg text-center text-lg font-medium transition-all ${
                isCorrectOption
                  ? 'border-green-500 bg-green-50 text-green-800'
                  : isIncorrectOption
                  ? 'border-red-500 bg-red-50 text-red-800'
                  : isSelected
                  ? 'border-vita-gold bg-amber-50 text-amber-900'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {option.value}
            </motion.button>
          );
        })}
      </motion.div>
    </TaskShell>
  );
}

// Balance Puzzle Visual Component
function BalancePuzzleVisual({ puzzle }: { puzzle: BalancePuzzle }) {
  // Check if shapes are emojis (1-2 chars) or text
  const isEmoji = (s: string) => s.length <= 2 || /\p{Emoji}/u.test(s);
  const allEmojis = [...puzzle.left, ...puzzle.right].every(item => isEmoji(item.shape));
  
  // Render shapes - either as repeated emojis or as "count × shape"
  const renderShapes = (items: typeof puzzle.left) => {
    return items.map((item, i) => (
      <span key={i} className={allEmojis ? "text-3xl" : "text-lg font-medium"}>
        {allEmojis 
          ? Array(item.count).fill(item.shape).join('')
          : `${item.count}×${item.shape}`
        }
        {i < items.length - 1 && !allEmojis && ' + '}
      </span>
    ));
  };
  
  return (
    <div className="bg-gradient-to-b from-amber-50 to-white border border-amber-200 rounded-xl p-6">
      {/* Simple visual equation */}
      <div className="flex items-center justify-center gap-4 py-4">
        {/* Left side */}
        <div className="bg-white border-2 border-amber-300 rounded-xl p-4 shadow-sm min-w-[80px] max-w-[200px]">
          <div className="flex flex-wrap gap-1 justify-center">
            {renderShapes(puzzle.left)}
          </div>
        </div>

        {/* Equals sign */}
        <div className="text-2xl font-bold text-amber-600">=</div>

        {/* Right side */}
        <div className="bg-white border-2 border-amber-300 rounded-xl p-4 shadow-sm min-w-[80px] max-w-[200px]">
          <div className="flex flex-wrap gap-1 justify-center">
            {renderShapes(puzzle.right)}
          </div>
        </div>
      </div>

      {/* Equation text */}
      <p className="text-[1rem] text-gray-700 text-center mt-4 font-medium">
        {puzzle.left.map((item) => `${item.count} ${item.shape}`).join(' + ')}
        {' = '}
        {puzzle.right.map((item) => `${item.count} ${item.shape}`).join(' + ')}
      </p>
    </div>
  );
}

// Pattern Puzzle Visual Component
function PatternPuzzleVisual({ puzzle }: { puzzle: PatternPuzzle }) {
  // Check if items are emojis (short) or text (long)
  const hasLongItems = puzzle.sequence.some(item => item.length > 2 && item !== '?');
  
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {puzzle.sequence.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-center rounded-lg ${
              hasLongItems 
                ? 'px-4 py-3 text-sm font-medium min-w-[80px]'
                : 'w-12 h-12 text-2xl'
            } ${
              item === '?'
                ? 'bg-white border-2 border-dashed border-purple-400 text-purple-400'
                : 'bg-white border border-gray-200 shadow-sm'
            }`}
          >
            {item}
          </motion.div>
        ))}
      </div>
      <p className="text-[0.875rem] text-gray-600 text-center mt-4">
        What comes next in the pattern?
      </p>
    </div>
  );
}

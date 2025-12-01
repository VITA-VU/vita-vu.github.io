// FillBlank Task Component
// Drag words from a bank into blanks in a sentence

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TaskShell } from '../common/TaskShell';
import { staggerChildren, staggerItem } from '../animations';
import type { FillBlankTask as FillBlankTaskType, TaskComponentProps, TaskResult, DraggableWord } from '../types';

interface FilledBlanks {
  [blankId: string]: DraggableWord | null;
}

export function FillBlankTask({ task, onComplete, onSkip }: TaskComponentProps<FillBlankTaskType>) {
  const [filledBlanks, setFilledBlanks] = useState<FilledBlanks>(() => {
    const initial: FilledBlanks = {};
    task.blanks.forEach((blank) => {
      initial[blank.id] = null;
    });
    return initial;
  });
  const [selectedWord, setSelectedWord] = useState<DraggableWord | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [startTime] = useState(Date.now());

  // Get words that haven't been placed yet
  const availableWords = task.words.filter(
    (word) => !Object.values(filledBlanks).some((filled) => filled?.id === word.id)
  );

  const handleWordClick = (word: DraggableWord) => {
    setSelectedWord(word);
  };

  const handleBlankClick = (blankId: string) => {
    if (!selectedWord) return;

    // If blank already has a word, return it to the bank
    setFilledBlanks((prev) => ({
      ...prev,
      [blankId]: selectedWord,
    }));
    setSelectedWord(null);
  };

  const handleRemoveWord = (blankId: string) => {
    setFilledBlanks((prev) => ({
      ...prev,
      [blankId]: null,
    }));
  };

  const allBlanksFilled = Object.values(filledBlanks).every((v) => v !== null);

  const handleNext = () => {
    if (!allBlanksFilled) return;

    // Check correctness
    let correctCount = 0;
    task.blanks.forEach((blank) => {
      const filled = filledBlanks[blank.id];
      if (filled && filled.id === blank.correctWordId) {
        correctCount++;
      }
    });

    const isCorrect = correctCount === task.blanks.length;
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    setTimeout(() => {
      const result: TaskResult = {
        taskId: task.question_code,
        taskType: 'fillblank',
        signalType: task.signalType,
        selectedRiasec: isCorrect && task.riasec ? task.riasec[0] : null,
        isCorrect,
        timeSpent: Date.now() - startTime,
        hintsUsed: false,
      };
      onComplete(result);
    }, 1000);
  };

  // Render text with blanks
  const renderTextWithBlanks = () => {
    const parts = task.textWithBlanks.split(/(\{\{\d+\}\})/);
    
    return parts.map((part, index) => {
      const match = part.match(/\{\{(\d+)\}\}/);
      if (match) {
        const blankIndex = parseInt(match[1], 10);
        const blank = task.blanks[blankIndex];
        if (!blank) return null;
        
        const filledWord = filledBlanks[blank.id];
        const isCorrectBlank = feedback && filledWord?.id === blank.correctWordId;
        const isIncorrectBlank = feedback === 'incorrect' && filledWord && filledWord.id !== blank.correctWordId;

        return (
          <motion.button
            key={`blank-${blankIndex}-${index}`}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (filledWord) {
                handleRemoveWord(blank.id);
              } else {
                handleBlankClick(blank.id);
              }
            }}
            disabled={!!feedback}
            className={`inline-flex items-center justify-center min-w-[80px] h-8 mx-1 px-3 rounded border-2 border-dashed cursor-pointer transition-all font-medium ${
              isCorrectBlank
                ? 'border-green-500 bg-green-50 text-green-800'
                : isIncorrectBlank
                ? 'border-red-500 bg-red-50 text-red-800'
                : filledWord
                ? 'border-blue-400 bg-blue-50 text-blue-800'
                : selectedWord
                ? 'border-amber-400 bg-amber-50 animate-pulse'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}
          >
            {filledWord ? filledWord.text : '___'}
          </motion.button>
        );
      }
      return <span key={`text-${index}`}>{part}</span>;
    });
  };

  return (
    <TaskShell
      question={task.question}
      hint={task.hint}
      onNext={handleNext}
      onSkip={onSkip}
      canSubmit={allBlanksFilled && !feedback}
      showFeedback={feedback}
    >
      {/* Sentence with blanks */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 text-lg leading-relaxed">
        {renderTextWithBlanks()}
      </div>

      {/* Word Bank */}
      <div className="mb-4">
        <p className="text-[0.875rem] text-gray-600 mb-3">
          {selectedWord ? '👆 Now tap a blank above to place the word' : '👇 Tap a word to select it'}
        </p>
        <div className="flex flex-wrap gap-2">
          {availableWords.map((word) => (
            <motion.button
              key={word.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleWordClick(word);
              }}
              disabled={!!feedback}
              type="button"
              className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors cursor-pointer ${
                selectedWord?.id === word.id
                  ? 'border-amber-500 bg-amber-100 text-amber-800 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {word.text}
            </motion.button>
          ))}
          {availableWords.length === 0 && !feedback && (
            <p className="text-gray-500 text-sm">All words placed! Click Next to check.</p>
          )}
        </div>
      </div>
    </TaskShell>
  );
}

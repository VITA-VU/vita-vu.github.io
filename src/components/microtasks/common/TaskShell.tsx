// Shared wrapper component for all task types
// Provides consistent layout, hint display, and action buttons

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Lightbulb } from 'lucide-react';
import { VitaButton } from '../../vita-ui/VitaButton';
import { slideUp } from '../animations';

interface TaskShellProps {
  question: string;
  hint?: string;
  learnBullets?: string[];
  onNext: () => void;
  onSkip: () => void;
  canSubmit: boolean;
  children: React.ReactNode;
  showFeedback?: 'correct' | 'incorrect' | null;
}

export function TaskShell({
  question,
  hint,
  learnBullets,
  onNext,
  onSkip,
  canSubmit,
  children,
  showFeedback,
}: TaskShellProps) {
  const [hintOpen, setHintOpen] = useState(false);

  function setOpened(boolean: boolean) {
    setHintOpen(boolean);
    localStorage.setItem('learnOpened', "true");
  }

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white border border-gray-200 rounded-lg p-4 md:p-6"
    >
      {/* Question */}
      <h3 className="text-[1.375rem] mb-4">{question}</h3>

      {/* Quick Lesson / Hint */}
      {(hint || (learnBullets && learnBullets.length > 0)) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => setOpened(!hintOpen)}
            aria-expanded={hintOpen}
            className="w-full flex items-center justify-between gap-2 p-4 hover:bg-amber-100 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <div className="flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-600 flex-shrink-0" />
              <span className="text-[0.875rem] font-medium text-amber-900">
                Need a hint?
              </span>
            </div>
            <ChevronDown
              size={18}
              className={`text-amber-600 transform transition-transform ${
                hintOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence initial={false}>
            {hintOpen && (
              <motion.div
                key="hint-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  {hint && (
                    <p className="text-[0.875rem] text-amber-900">{hint}</p>
                  )}
                  {learnBullets && learnBullets.length > 0 && (
                    <ul className="space-y-1.5 ml-6 mt-2">
                      {learnBullets.map((bullet, index) => (
                        <li
                          key={index}
                          className="text-[0.8125rem] text-amber-900 list-disc"
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Task Content */}
      <div className="my-6">{children}</div>

      {/* Feedback overlay */}
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mb-4 p-3 rounded-lg text-center ${
            showFeedback === 'correct'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          {showFeedback === 'correct' ? '✓ Correct!' : '✗ Not quite right'}
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-6">
        <VitaButton
          variant="primary"
          onClick={onNext}
          disabled={!canSubmit}
        >
          Next
        </VitaButton>
        <VitaButton variant="ghost" onClick={onSkip}>
          Skip
        </VitaButton>
      </div>
    </motion.div>
  );
}

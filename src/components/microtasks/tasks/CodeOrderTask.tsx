// CodeOrder Task Component
// Drag code lines into the correct order to make a working program

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Play, Check, X } from 'lucide-react';
import { TaskShell } from '../common/TaskShell';
import { useDragReorder } from '../hooks/useDragReorder';
import type { CodeOrderTask as CodeOrderTaskType, TaskComponentProps, TaskResult, CodeLine } from '../types';

export function CodeOrderTask({ task, onComplete, onSkip }: TaskComponentProps<CodeOrderTaskType>) {
  // Shuffle lines initially
  const [shuffledLines] = useState(() => {
    return [...task.lines].sort(() => Math.random() - 0.5);
  });
  
  const { items, handleDragStart, handleDragOver, handleDragEnd, moveUp, moveDown } = useDragReorder(
    shuffledLines.map((line) => ({ ...line, id: line.id }))
  );
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showOutput, setShowOutput] = useState(false);
  const [startTime] = useState(Date.now());

  const checkOrder = (): boolean => {
    return items.every((line, index) => (line as CodeLine).correctPosition === index);
  };

  const handleRun = () => {
    const isCorrect = checkOrder();
    setShowOutput(true);
    setFeedback(isCorrect ? 'correct' : 'incorrect');
  };

  const handleNext = () => {
    if (!feedback) {
      handleRun();
      return;
    }

    const isCorrect = feedback === 'correct';
    
    const result: TaskResult = {
      taskId: task.question_code,
      taskType: 'codeorder',
      signalType: task.signalType,
      selectedRiasec: isCorrect && task.riasec ? task.riasec[0] : null,
      isCorrect,
      timeSpent: Date.now() - startTime,
      hintsUsed: false,
    };
    onComplete(result);
  };

  // Language-specific styling
  const getLanguageColor = () => {
    switch (task.language) {
      case 'python': return 'bg-blue-600';
      case 'javascript': return 'bg-yellow-500';
      default: return 'bg-gray-600';
    }
  };

  return (
    <TaskShell
      question={task.question}
      hint={task.hint}
      onNext={handleNext}
      onSkip={onSkip}
      canSubmit={!feedback || feedback === 'correct'}
      showFeedback={feedback}
    >
      {/* Language badge and description */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-2 py-1 text-xs font-mono text-white rounded ${getLanguageColor()}`}>
          {task.language}
        </span>
        <span className="text-sm text-gray-600">{task.description}</span>
      </div>

      {/* Code editor area */}
      <div className="bg-gray-900 rounded-xl overflow-hidden mb-4">
        {/* Editor header */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-2 text-xs text-gray-400 font-mono">main.{task.language === 'python' ? 'py' : 'js'}</span>
        </div>

        {/* Code lines */}
        <div className="p-4 space-y-1">
          {items.map((line: CodeLine, index: number) => {
            const isCorrectPosition = feedback && line.correctPosition === index;
            const isIncorrectPosition = feedback === 'incorrect' && line.correctPosition !== index;

            return (
              <motion.div
                key={line.id}
                layout
                draggable={!feedback}
                onDragStart={() => handleDragStart(line.id)}
                onDragOver={(e: React.DragEvent) => handleDragOver(e, line.id)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-2 p-2 rounded font-mono text-sm cursor-move transition-all ${
                  isCorrectPosition
                    ? 'bg-green-900/50 border border-green-500'
                    : isIncorrectPosition
                    ? 'bg-red-900/50 border border-red-500'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {/* Line number */}
                <span className="w-6 text-gray-500 text-right select-none">{index + 1}</span>
                
                {/* Code */}
                <code className="flex-1 text-green-400">{line.code}</code>

                {/* Mobile reorder buttons */}
                <div className="flex flex-col gap-0.5 md:hidden">
                  <button
                    onClick={() => moveUp(line.id)}
                    disabled={index === 0 || !!feedback}
                    className="p-0.5 text-gray-400 hover:text-white disabled:opacity-30"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => moveDown(line.id)}
                    disabled={index === items.length - 1 || !!feedback}
                    className="p-0.5 text-gray-400 hover:text-white disabled:opacity-30"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* Feedback icon */}
                {feedback && (
                  <span className="ml-2">
                    {isCorrectPosition ? (
                      <Check size={16} className="text-green-400" />
                    ) : isIncorrectPosition ? (
                      <X size={16} className="text-red-400" />
                    ) : null}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Output area */}
        {showOutput && (
          <div className="border-t border-gray-700 p-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <Play size={12} />
              <span>Output</span>
            </div>
            <pre className={`font-mono text-sm ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
              {feedback === 'correct' 
                ? task.expectedOutput || '✓ Program runs correctly!'
                : '✗ Error: Code is not in the correct order'}
            </pre>
          </div>
        )}
      </div>

      {/* Run button */}
      {!feedback && (
        <button
          onClick={handleRun}
          className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          <Play size={18} />
          Run Code
        </button>
      )}
    </TaskShell>
  );
}

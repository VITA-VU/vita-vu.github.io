// Classify Task Component
// Drag items into category buckets - performance-based task

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TaskShell } from '../common/TaskShell';
import { staggerChildren, staggerItem, bucketHighlight } from '../animations';
import type { ClassifyTask as ClassifyTaskType, TaskComponentProps, TaskResult, ClassifyItem } from '../types';

interface BucketState {
  [category: string]: ClassifyItem[];
}

export function ClassifyTask({ task, onComplete, onSkip }: TaskComponentProps<ClassifyTaskType>) {
  const [unplacedItems, setUnplacedItems] = useState<ClassifyItem[]>(task.items);
  const [buckets, setBuckets] = useState<BucketState>(() => {
    const initial: BucketState = {};
    task.categories.forEach((cat) => {
      initial[cat] = [];
    });
    return initial;
  });
  const [draggedItem, setDraggedItem] = useState<ClassifyItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [startTime] = useState(Date.now());

  const handleDragStart = (item: ClassifyItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    setActiveCategory(category);
  };

  const handleDragLeave = () => {
    setActiveCategory(null);
  };

  const handleDrop = (category: string) => {
    if (!draggedItem) return;

    // Remove from unplaced
    setUnplacedItems((prev) => prev.filter((i) => i.id !== draggedItem.id));

    // Remove from any other bucket
    setBuckets((prev) => {
      const newBuckets = { ...prev };
      Object.keys(newBuckets).forEach((cat) => {
        newBuckets[cat] = newBuckets[cat].filter((i) => i.id !== draggedItem.id);
      });
      // Add to target bucket
      newBuckets[category] = [...newBuckets[category], draggedItem];
      return newBuckets;
    });

    setDraggedItem(null);
    setActiveCategory(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setActiveCategory(null);
  };

  // Mobile tap-to-place: tap item, then tap bucket
  const [selectedItem, setSelectedItem] = useState<ClassifyItem | null>(null);

  const handleItemTap = (item: ClassifyItem) => {
    setSelectedItem(item);
  };

  const handleBucketTap = (category: string) => {
    if (!selectedItem) return;

    // Remove from unplaced
    setUnplacedItems((prev) => prev.filter((i) => i.id !== selectedItem.id));

    // Remove from any other bucket and add to target
    setBuckets((prev) => {
      const newBuckets = { ...prev };
      Object.keys(newBuckets).forEach((cat) => {
        newBuckets[cat] = newBuckets[cat].filter((i) => i.id !== selectedItem.id);
      });
      newBuckets[category] = [...newBuckets[category], selectedItem];
      return newBuckets;
    });

    setSelectedItem(null);
  };

  const allPlaced = unplacedItems.length === 0;

  const handleNext = () => {
    if (!allPlaced) return;

    // Check correctness
    let correctCount = 0;
    let totalCount = 0;

    Object.entries(buckets).forEach(([category, items]) => {
      items.forEach((item) => {
        totalCount++;
        if (item.correctCategory === category) {
          correctCount++;
        }
      });
    });

    const isCorrect = correctCount === totalCount;
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    // Delay to show feedback
    setTimeout(() => {
      const result: TaskResult = {
        taskId: task.question_code,
        taskType: 'classify',
        signalType: task.signalType,
        selectedRiasec: isCorrect && task.riasec ? task.riasec[0] : null,
        isCorrect,
        timeSpent: Date.now() - startTime,
        hintsUsed: false,
      };
      onComplete(result);
    }, 1000);
  };

  return (
    <TaskShell
      question={task.question}
      hint={task.hint}
      onNext={handleNext}
      onSkip={onSkip}
      canSubmit={allPlaced && !feedback}
      showFeedback={feedback}
    >
      {/* Category Buckets */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {task.categories.map((category) => (
          <motion.div
            key={category}
            variants={bucketHighlight}
            animate={activeCategory === category ? 'active' : 'idle'}
            onDragOver={(e) => handleDragOver(e, category)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(category)}
            onClick={() => handleBucketTap(category)}
            className={`min-h-[120px] p-3 border-2 border-dashed rounded-lg transition-colors ${
              activeCategory === category
                ? 'border-vita-gold bg-amber-50'
                : selectedItem
                ? 'border-gray-300 bg-gray-50 cursor-pointer hover:border-vita-gold/50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <h4 className="text-[0.875rem] font-medium text-gray-700 mb-2 text-center">
              {category}
            </h4>
            <div className="space-y-2">
              {buckets[category].map((item) => (
                <div
                  key={item.id}
                  className={`p-2 bg-white border rounded text-[0.875rem] ${
                    feedback && item.correctCategory !== category
                      ? 'border-red-300 bg-red-50'
                      : feedback && item.correctCategory === category
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  {item.text}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Unplaced Items */}
      {unplacedItems.length > 0 && (
        <div>
          <p className="text-[0.875rem] text-gray-600 mb-3">
            {selectedItem ? 'Now tap a category above' : 'Drag items to a category, or tap to select'}
          </p>
          <motion.div
            variants={staggerChildren}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap gap-2"
          >
            {unplacedItems.map((item) => (
              <motion.div
                key={item.id}
                variants={staggerItem}
                draggable
                onDragStart={() => handleDragStart(item)}
                onDragEnd={handleDragEnd}
                onClick={() => handleItemTap(item)}
                className={`px-3 py-2 bg-white border-2 rounded-lg cursor-move text-[0.875rem] transition-all ${
                  draggedItem?.id === item.id
                    ? 'border-vita-gold opacity-50'
                    : selectedItem?.id === item.id
                    ? 'border-vita-gold bg-amber-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {item.text}
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {allPlaced && !feedback && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-[0.875rem] text-green-800">
            ✓ All items placed! Click Next to check your answers.
          </p>
        </div>
      )}
    </TaskShell>
  );
}

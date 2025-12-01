// Graph Task Component
// Interactive chart where users click on bars/points to answer

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TaskShell } from '../common/TaskShell';
import { chartBarGrow } from '../animations';
import type { GraphTask as GraphTaskType, TaskComponentProps, TaskResult } from '../types';

export function GraphTask({ task, onComplete, onSkip }: TaskComponentProps<GraphTaskType>) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [startTime] = useState(Date.now());

  const { graphData, clickableRegions, correctRegion } = task;
  const maxValue = Math.max(...graphData.values);

  const handleBarClick = (regionId: string) => {
    if (feedback) return;
    setSelectedRegion(regionId);
  };

  const handleNext = () => {
    if (!selectedRegion) return;

    const isCorrect = selectedRegion === correctRegion;
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    const selectedRegionData = clickableRegions.find((r) => r.id === selectedRegion);

    setTimeout(() => {
      const result: TaskResult = {
        taskId: task.question_code,
        taskType: 'graph',
        signalType: task.signalType,
        selectedRiasec: selectedRegionData?.riasec || null,
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
      canSubmit={selectedRegion !== null && !feedback}
      showFeedback={feedback}
    >
      {/* Chart Container */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        {/* Chart Title */}
        {graphData.title && (
          <h4 className="text-[0.875rem] font-medium text-gray-700 text-center mb-4">
            {graphData.title}
          </h4>
        )}

        {/* Bar Chart */}
        {graphData.type === 'bar' && (
          <div className="flex items-end justify-between h-52 pt-6 px-4 w-full">
            {graphData.values.map((value, index) => {
              // Match by dataIndex if present, otherwise by position in array
              const region = clickableRegions.find((r) => r.dataIndex === index) || clickableRegions[index];
              const isSelected = region && selectedRegion === region.id;
              const isCorrectBar = region && feedback && region.id === correctRegion;
              const isIncorrectBar = region && feedback === 'incorrect' && isSelected;
              const barHeight = Math.max((value / maxValue) * 150, 20);

              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  {/* Value label */}
                  <span className="text-[0.75rem] text-gray-600 mb-1 font-medium">{value}</span>
                  
                  {/* Bar - using fixed pixel height */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: barHeight }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={() => region && handleBarClick(region.id)}
                    style={{ 
                      width: '48px',
                      borderRadius: '4px 4px 0 0',
                      cursor: 'pointer',
                      backgroundColor: isCorrectBar
                        ? '#22c55e'
                        : isIncorrectBar
                        ? '#f87171'
                        : isSelected
                        ? '#f59e0b'
                        : '#3b82f6'
                    }}
                  />
                  
                  {/* Label */}
                  <span className="text-[0.75rem] text-gray-600 mt-2 font-medium">
                    {graphData.labels[index]}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Line Chart */}
        {graphData.type === 'line' && (
          <div className="relative h-48">
            <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1="40"
                  y1={180 - y * 1.6}
                  x2="380"
                  y2={180 - y * 1.6}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}

              {/* Line path */}
              <motion.polyline
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                points={graphData.values
                  .map((v, i) => {
                    const x = 40 + (i * 340) / (graphData.values.length - 1);
                    const y = 180 - (v / maxValue) * 160;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />

              {/* Clickable points */}
              {graphData.values.map((value, index) => {
                // Match by dataIndex if present, otherwise by position in array
                const region = clickableRegions.find((r) => r.dataIndex === index) || clickableRegions[index];
                const isSelected = region && selectedRegion === region.id;
                const isCorrectPoint = region && feedback && region.id === correctRegion;
                const x = 40 + (index * 340) / (graphData.values.length - 1);
                const y = 180 - (value / maxValue) * 160;

                return (
                  <g key={index}>
                    <motion.circle
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                      cx={x}
                      cy={y}
                      r={isSelected ? 10 : 8}
                      fill={
                        isCorrectPoint
                          ? '#22c55e'
                          : isSelected
                          ? '#C4A747'
                          : '#3b82f6'
                      }
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer"
                      onClick={() => region && handleBarClick(region.id)}
                    />
                    {/* Label below */}
                    <text
                      x={x}
                      y="195"
                      textAnchor="middle"
                      className="text-[10px] fill-gray-600"
                    >
                      {graphData.labels[index]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Y-axis label */}
        {graphData.yAxisLabel && (
          <p className="text-[0.75rem] text-gray-500 text-center mt-2">
            {graphData.yAxisLabel}
          </p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-[0.875rem] text-blue-900">
          👆 Click on a bar or point to select your answer
        </p>
      </div>
    </TaskShell>
  );
}

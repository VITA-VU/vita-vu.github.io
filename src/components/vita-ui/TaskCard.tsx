import React from 'react';
import { TimerPill } from './TimerPill';
import { VitaButton } from './VitaButton';
import { Lightbulb } from 'lucide-react';

interface TaskCardProps {
  stimulusTitle: string;
  stimulusBody: string | React.ReactNode;
  learnBullets: string[];
  question: string;
  options: string[];
  selectedOption?: number;
  onSelectOption: (index: number) => void;
  onNext: () => void;
  onNotSure: () => void;
  showTimer?: boolean;
}

export function TaskCard({
  stimulusTitle,
  stimulusBody,
  learnBullets,
  question,
  options,
  selectedOption,
  onSelectOption,
  onNext,
  onNotSure,
  showTimer = true
}: TaskCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
      {/* Timer */}
      {showTimer && (
        <div className="flex justify-end mb-4">
          <TimerPill seconds={90} />
        </div>
      )}
      
      {/* Stimulus */}
      <div className="mb-6">
        <h3 className="text-[1.375rem] mb-3">{stimulusTitle}</h3>
        <div className="text-[1rem] text-gray-700 leading-relaxed">
          {stimulusBody}
        </div>
      </div>
      
      {/* Learn Bubble */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2 mb-2">
          <Lightbulb size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <span className="text-[0.875rem] text-amber-900">Quick lesson</span>
        </div>
        <ul className="space-y-1.5 ml-6">
          {learnBullets.map((bullet, index) => (
            <li key={index} className="text-[0.8125rem] text-amber-900 list-disc">
              {bullet}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Question */}
      <div className="mb-4">
        <p className="text-[1rem] mb-3">{question}</p>
        <div className="space-y-2">
          {options.map((option, index) => (
            <label
              key={index}
              className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all min-h-[44px] ${
                selectedOption === index
                  ? 'border-vita-gold bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="task-option"
                checked={selectedOption === index}
                onChange={() => onSelectOption(index)}
                className="mt-0.5 accent-vita-gold"
              />
              <span className="text-[1rem] flex-1">
                <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col gap-2 mt-6">
        <VitaButton 
          variant="primary" 
          onClick={onNext}
          disabled={selectedOption === undefined}
        >
          Next
        </VitaButton>
        <VitaButton variant="ghost" onClick={onNotSure}>
          I am not sure
        </VitaButton>
      </div>
    </div>
  );
}

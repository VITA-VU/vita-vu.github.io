import React, { useState } from 'react';
import { TimerPill } from './TimerPill';
import { VitaButton } from './VitaButton';
import { ChevronDown, Lightbulb } from 'lucide-react';
import { AnimatePresence, motion } from "framer-motion";

export interface TaskCardProps {
  //stimulusTitle: string;
  //stimulusBody: string | React.ReactNode;
  question_code: string;
  learnBullets: string[];
  question: string;
  options: {
    text: string;
    riasec: string;
  }[];
  selectedOption?: number;
  onSelectOption: (index: number, riasec: string) => void;
  onNext: () => void;
  onNotSure: () => void;
  showTimer?: boolean;
}

export function TaskCard({
  //stimulusTitle,
  //stimulusBody,
  question_code,
  learnBullets,
  question,
  options,
  selectedOption,
  onSelectOption,
  onNext,
  onNotSure,
  showTimer = false
}: TaskCardProps) {
  const [learnOpen, setLearnOpen] = useState(false);
  
  function setOpened(boolean: boolean) {
    setLearnOpen(boolean);
    localStorage.setItem('learnOpened', "true");
  }
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
      {/* Timer */}
      {showTimer && (
        <div className="flex justify-end mb-4">
          <TimerPill seconds={90} />
        </div>
      )}
      
      {/* Stimulus */}
{/*        <div className="mb-6">
        <h3 className="text-[1.375rem] mb-3">{stimulusTitle}</h3>
        <div className="text-[1rem] text-gray-700 leading-relaxed">
          {stimulusBody}
        </div>
      </div>  */}

      
      {/* Question */}
      <div className="mb-4">
        <p className="text-[1rem] mb-3">{question}</p>

                   {/* Quick Lesson */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg mb-6">
        <button
          type="button"
          onClick={() => setOpened(!learnOpen)}
          aria-expanded={learnOpen}
          className="w-full flex items-center justify-between gap-2 p-4 hover:bg-amber-100 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <div className="flex items-center gap-2">
            <Lightbulb size={18} className="text-amber-600 flex-shrink-0" />
            <span className="text-[0.875rem] font-medium text-amber-900">
              Quick lesson
            </span>
          </div>

          <span
            className={`text-amber-600 transform transition-transform ${
              learnOpen ? "rotate-180" : ""
            }`}
            aria-hidden
          >
            <ChevronDown
              size={18}
              className={`text-amber-600 transform transition-transform ${
                learnOpen ? "rotate-180" : ""
              }`}
            />
          </span>
        </button>
              

        {/* TRUE Collapse */}
         <AnimatePresence initial={false}>
          {learnOpen && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
            <ul className="space-y-1.5 px-4 pb-4 ml-6">
                {learnBullets.map((bullet, index) => (
                  <li
                    key={index}
                    className="text-[0.8125rem] text-amber-900 list-disc"
                  >
                    {bullet}
                  </li>
                ))}
          </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>  


        <div className="space-y-2">
                <p className="text-[0.8125rem] text-gray-500 mt-2">Note: There is no one correct answer! This is to help us discover how you like to work. </p>
                <br />
          {options.map((option, index) => (
            <label key={option.key} 
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
                onChange={() => onSelectOption(index, option.riasec)}
                className="mt-0.5 accent-vita-gold"
              />
              <span className="text-[1rem] flex-1">
                <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
                {option.text}
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
          I'm not sure
        </VitaButton>
      </div>
    </div>
  );
}

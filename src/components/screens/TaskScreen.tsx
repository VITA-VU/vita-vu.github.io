import React, { useState } from 'react';
import { TaskCard } from '../vita-ui/TaskCard';
import { ProgressDots } from '../vita-ui/ProgressDots';
import { LanguageToggle } from '../LanguageToggle';
import { VitaToast, useToast } from '../vita-ui/VitaToast';
import { HelpCircle } from 'lucide-react';
import logo from '../imgs/VU-logo-RGB.png';

interface TaskScreenProps {

taskVariant?: 'psychology' | 'business-analytics' | 'physics';
  onComplete: () => void;
  currentLang: 'EN' | 'NL';
  onLangChange: (lang: 'EN' | 'NL') => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  goHome?: () => void;
  goBack?: () => void;
}

const tasks = {
  psychology: {
    stimulusTitle: 'Memory and Notifications',
    stimulusBody: 'Half the students study a twenty word list with phone notifications on, half with notifications off. Five minutes later everyone writes down as many words as they remember.',
    learnBullets: [
      'Keep only one variable different',
      'Random assignment avoids self-selection',
      'Use the same list and timing for both groups'
    ],
    question: 'What is the best first design move?',
    options: [
      'Randomly assign students to on versus off',
      'Let friends choose their group',
      'Tell the on group the hypothesis',
      'Use different word lists without checking difficulty'
    ],
    correctAnswer: 0
  },
  'business-analytics': {
    stimulusTitle: 'Ad Spend and Orders',
    stimulusBody: 'A small webshop asks if more ad spend this week means more orders this week. You have twelve weeks of ad spend and orders.',
    learnBullets: [
      'A scatter shows relationship',
      'Outliers can trick a trend',
      'A lag by one week can also matter'
    ],
    question: 'What is the best first move?',
    options: [
      'Make a scatter of ad spend versus orders and draw a quick trend line',
      'Make a pie chart of orders by week',
      'Group ad spend into bins without looking at orders',
      'Compute the median order value'
    ],
    correctAnswer: 0
  },
  physics: {
    stimulusTitle: 'Popcorn on a Train',
    stimulusBody: 'You toss a popcorn kernel straight up on a smooth train moving at a steady speed. Someone on the platform watches through the window.',
    learnBullets: [
      'In the train frame the path is up and down',
      'In the ground frame the path curves forward',
      'Relative motion explains why it still lands in your hand'
    ],
    question: 'Which question sounds most like what a physicist would ask next?',
    options: [
      'Which frame are we using, train or ground?',
      'What flavor is the popcorn?',
      'Could the window tint affect color?',
      'Should the conductor make an announcement?'
    ],
    correctAnswer: 0
  }
};

export function TaskScreen({ 
  taskVariant = 'psychology',
  onComplete,
  currentLang,
  onLangChange,
  goBack, goHome 
}: TaskScreenProps) {
  const [selectedOption, setSelectedOption] = useState<number | undefined>();
  const [showWhyOverlay, setShowWhyOverlay] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  
  const task = tasks[taskVariant];
  
  const handleNext = () => {
    showToast('Answer recorded');
    setTimeout(() => {
      onComplete();
    }, 1000);
  };
  
  const handleNotSure = () => {
    showToast('Skipped');
    setTimeout(() => {
      onComplete();
    }, 1000);
  };
  
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button 
  onClick={() => goHome?.()} 
  aria-label="Go Home"
  className="flex items-center"
>
  <img  src={logo}  alt="VU Logo" width='150' height='100' />
</button>

{goBack && (
  <button 
    onClick={goBack} 
    aria-label="Go Back"
    className="ml-3 text-sm text-vita-deep-blue hover:underline"
  >
    ← Back
  </button>
)}        </div>
        <LanguageToggle currentLang={currentLang} onToggle={onLangChange} />
      </div>
      
      {/* Content - Desktop uses 2 column layout */}
      <div className="max-w-6xl mx-auto p-6">


        {/* Progress and Why Link */}
        <div className="flex items-center justify-between mb-6">
          <ProgressDots total={3} current={1} />
          <button
            onClick={() => setShowWhyOverlay(true)}
            className="flex items-center gap-1 text-[0.8125rem] text-vita-deep-blue hover:underline"
          >
            <HelpCircle size={14} />
            View why we ask this
          </button>
        </div>
        
        {/* Task Card */}
        <TaskCard
          stimulusTitle={task.stimulusTitle}
          stimulusBody={task.stimulusBody}
          learnBullets={task.learnBullets}
          question={task.question}
          options={task.options}
          selectedOption={selectedOption}
          onSelectOption={setSelectedOption}
          onNext={handleNext}
          onNotSure={handleNotSure}
        />
      </div>
      
      {/* Why Overlay */}
      {showWhyOverlay && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50" 
          onClick={() => setShowWhyOverlay(false)}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[1.375rem] mb-4">Why we ask this</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex gap-3">
                <span className="text-vita-gold">•</span>
                <span className="text-[1rem]">Tasks show you what thinking feels like in this field</span>
              </li>
              <li className="flex gap-3">
                <span className="text-vita-gold">•</span>
                <span className="text-[1rem]">Your choices help us suggest programmes that match your style</span>
              </li>
              <li className="flex gap-3">
                <span className="text-vita-gold">•</span>
                <span className="text-[1rem]">There are no wrong answers, just different approaches</span>
              </li>
            </ul>
            <VitaButton 
              variant="primary" 
              onClick={() => setShowWhyOverlay(false)} 
              className="w-full"
            >
              Got it
            </VitaButton>
          </div>
        </div>
      )}
      
      <VitaToast 
        message={toast.message}
        show={toast.show}
        onClose={hideToast}
      />
    </div>
  );
}

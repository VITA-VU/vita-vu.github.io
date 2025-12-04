import React, { useState, useEffect } from 'react';
import { TaskCard } from '../vita-ui/TaskCard';
import { MicrotaskRenderer } from '../microtasks/MicrotaskRenderer';
import { ProgressDots } from '../vita-ui/ProgressDots';
import { LanguageToggle } from '../LanguageToggle';
import { VitaToast, useToast } from '../vita-ui/VitaToast';
import { HelpCircle } from 'lucide-react';
// import logo from '../imgs/VU-logo-RGB.png';
import { fetchMicrotask } from '../api/requests';
import { useAppContext } from '../../App'; 

interface TaskScreenProps {

//taskVariant?: 'psychology' | 'business-analytics' | 'physics';
  onComplete: () => void;
  currentLang: 'EN' | 'NL';
  onLangChange: (lang: 'EN' | 'NL') => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  goHome?: () => void;
  goBack?: () => void;
}

localStorage.setItem('learnOpened', "false");
localStorage.setItem('isCorrect', "");
localStorage.setItem('answer', "");
const start = new Date().getTime();

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
  //taskVariant = 'psychology',
  onComplete,
  currentLang,
  onLangChange,
  goBack, goHome 
}: TaskScreenProps) {
  const [selectedOption, setSelectedOption] = useState<number | undefined>();
  const [selectedRiasec, setSelectedRiasec] = useState<string | null>(null);
  const { task } = useAppContext();

  function handleSelectOption(index: number, riasec: string) {
    setSelectedOption(index);
    setSelectedRiasec(riasec);
  }  
  const [showWhyOverlay, setShowWhyOverlay] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  if (!task) {
  return <div className="p-6">Loading…</div>;
}
  
  const handleNext = () => {
    localStorage.setItem('taskAnswered', 'true');
    localStorage.setItem('answer', selectedRiasec || '');
    localStorage.setItem('taskTime', (String(new Date().getTime() - start)));
    onComplete();
  };
  
  const handleNotSure = () => {
    localStorage.setItem('taskAnswered', 'false');
    localStorage.setItem('answer', '');
    localStorage.setItem('taskTime', (String(new Date().getTime() - start)));
    onComplete();
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
  <span className="text-xl font-bold text-blue-900">VU</span>
</button>

       </div>
        <LanguageToggle currentLang={currentLang} onToggle={onLangChange} />
      </div>
      
      {/* Content - Desktop uses 2 column layout */}
      <div className="max-w-6xl mx-auto p-6">


        {/* Progress and Why Link */}
        <div className="flex items-center justify-between mb-6">
          {/* <ProgressDots total={3} current={1} /> */}
          {/* <button
            onClick={() => setShowWhyOverlay(true)}
            className="flex items-center gap-1 text-[0.8125rem] text-vita-deep-blue hover:underline"
          >
            <HelpCircle size={14} />
            View why we ask this
          </button> */}
        </div>
        
        {/* DEBUG PANEL - comment out when not needed */}
        {(() => {
          const AXES = ['R', 'I', 'A', 'S', 'E', 'C'];
          const studentVectorRaw = localStorage.getItem('studentVector') || '[0.167,0.167,0.167,0.167,0.167,0.167]';
          const studentVector = JSON.parse(studentVectorRaw);
          const topIdx = studentVector.indexOf(Math.max(...studentVector));
          const topAxis = AXES[topIdx];
          const entropy = parseFloat(localStorage.getItem('entropy') || '1.79');
          const aptProb = parseFloat(localStorage.getItem('aptProb') || '0');
          const program = localStorage.getItem('currentProgram') || '-';
          const policy = localStorage.getItem('policy') || '-';
          const shouldStop = localStorage.getItem('stop');
          const signalType = localStorage.getItem('signalType') || 'personality';
          
          return (
            <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border-2 border-green-400">
              <div className="text-green-600 font-bold mb-2">🔍 DEBUG INFO</div>
              <div className="flex flex-wrap gap-4 justify-between items-center text-sm">
                <div><span className="text-slate-500">Top:</span> <span className="font-bold text-blue-600">{topAxis}</span></div>
                <div><span className="text-slate-500">Program:</span> <span className="font-medium text-green-700">{program}</span></div>
                <div><span className="text-slate-500">Entropy:</span> <span className="font-mono">{entropy.toFixed(3)}</span></div>
                <div><span className="text-slate-500">Apt%:</span> <span className="font-mono">{(aptProb * 100).toFixed(0)}%</span></div>
                <div><span className="text-slate-500">Policy:</span> <span className="font-mono text-xs">{policy}</span></div>
                <div><span className="text-slate-500">Stop:</span> <span className={`font-mono ${shouldStop === 'true' ? 'text-red-600' : 'text-green-600'}`}>{shouldStop}</span></div>
                <div><span className="text-slate-500">Signal:</span> <span className={`font-mono ${signalType === 'aptitude' ? 'text-purple-600' : 'text-blue-600'}`}>{signalType}</span></div>
              </div>
              <div className="flex gap-1 mt-3">
                {AXES.map((axis, idx) => (
                  <div key={axis} className="flex-1 text-center">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${axis === topAxis ? 'bg-blue-600' : 'bg-blue-300'}`} style={{ width: `${studentVector[idx] * 100}%` }} />
                    </div>
                    <div className={`text-xs mt-1 ${axis === topAxis ? 'font-bold text-blue-600' : 'text-slate-500'}`}>{axis}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
        {/* END DEBUG PANEL */}

        {/* Task Renderer - handles all task types */}
        {task.type && task.type !== 'mcq' ? (
          <MicrotaskRenderer 
            task={task} 
            onComplete={(result: any) => {
              // Store the answer - for personality tasks it's selectedRiasec, for aptitude it varies
              const answer = result.selectedRiasec ?? result.taskId ?? '';
              localStorage.setItem('answer', String(answer));
              localStorage.setItem('isCorrect', String(result.isCorrect ?? ''));
              localStorage.setItem('signalType', task.signalType ?? 'personality');
              onComplete();
            }} 
            onSkip={() => {
              localStorage.setItem('taskAnswered', 'false');
              localStorage.setItem('answer', '');
              localStorage.setItem('isCorrect', '');
              onComplete();
            }}
          />
        ) : (
          <TaskCard
            question_code={task.question_code || 'unknown'}
            learnBullets={task.learnBullets}
            question={task.question}
            options={task.options}
            selectedOption={selectedOption}
            onSelectOption={handleSelectOption}
            onNext={handleNext}
            onNotSure={handleNotSure}
          />
        )}
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
            <button 
              onClick={() => setShowWhyOverlay(false)} 
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Got it
            </button>
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

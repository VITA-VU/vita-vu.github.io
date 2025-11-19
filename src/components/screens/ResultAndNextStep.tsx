import React, { useState } from 'react';
import { VitaButton } from '../vita-ui/VitaButton';
import { VitaCard } from '../vita-ui/VitaCard';
import { VitaChip } from '../vita-ui/VitaChip';
import { LanguageToggle } from '../LanguageToggle';
import { Smile, Meh, Frown } from 'lucide-react';
import logo from '../imgs/VU-logo-RGB.png';

interface ResultAndNextStepProps {

onSeeWeek: (programme: string) => void;
  onTryAnother: () => void;
  currentLang: 'EN' | 'NL';
  onLangChange: (lang: 'EN' | 'NL') => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  goHome?: () => void;
  goBack?: () => void;
}

const programmeMatches = [
  {
    id: 'investigative',
    title: 'Investigative programmes',
    whyFits: [
      'You enjoyed a quick design question and a data reasoning step',
      'You preferred clear rules and simple evidence'
    ],
    watchOut: 'Heavier math in later courses',
    confidence: 'High' as const,
    examples: ['Psychology', 'Computer Science', 'Physics']
  },
  {
    id: 'social',
    title: 'Social programmes',
    whyFits: [
      'You liked thinking about people and controlled experiments'
    ],
    watchOut: 'Some tasks require statistics practice',
    confidence: 'Medium' as const,
    examples: ['Psychology', 'Sociology', 'Education']
  }
];

export function ResultAndNextStep({
  onSeeWeek,
  onTryAnother,
  currentLang,
  onLangChange,
  goBack, goHome
}: ResultAndNextStepProps) {
  const [feedback, setFeedback] = useState<'clear' | 'neutral' | 'confusing' | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [helpfulPart, setHelpfulPart] = useState<string>('');
  
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
      
      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">


        <div>
          <h2 className="text-[1.375rem] mb-2">Your matches</h2>
          <p className="text-[1rem] text-gray-600">
            Based on your responses, these programmes might be a good fit
          </p>
        </div>
        
        {/* Programme Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {programmeMatches.map((match) => (
            <VitaCard key={match.id} variant="emphasis">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-[1rem]">{match.title}</h3>
                  <VitaChip 
                    variant={match.confidence === 'High' ? 'success' : 'info'} 
                    size="small"
                  >
                    {match.confidence}
                  </VitaChip>
                </div>
                
                <div>
                  <p className="text-[0.875rem] mb-2">Why this fits:</p>
                  <ul className="space-y-1.5">
                    {match.whyFits.map((reason, idx) => (
                      <li key={idx} className="flex gap-2 text-[0.8125rem] text-gray-700">
                        <span className="text-green-600">✓</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex gap-2">
                  <span className="text-amber-600">!</span>
                  <p className="text-[0.8125rem] text-gray-700">
                    Watch out: {match.watchOut}
                  </p>
                </div>
                
                <div className="pt-3 space-y-2">
                  <VitaButton
                    variant="primary"
                    onClick={() => onSeeWeek(match.examples[0].toLowerCase())}
                    className="w-full"
                  >
                    See a week in this programme
                  </VitaButton>
                  <VitaButton
                    variant="ghost"
                    onClick={onTryAnother}
                    className="w-full"
                  >
                    Try one more task in a neighbour area
                  </VitaButton>
                </div>
              </div>
            </VitaCard>
          ))}
        </div>
        
        {/* Reflection Question */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <p className="text-[1rem]">How did that feel?</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setFeedback('clear')}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg min-w-[80px] min-h-[80px] transition-all ${
                feedback === 'clear' ? 'bg-green-100 border-2 border-green-500' : 'bg-white border border-gray-200'
              }`}
            >
              <Smile size={32} className={feedback === 'clear' ? 'text-green-600' : 'text-gray-400'} />
              <span className="text-[0.8125rem]">Clear</span>
            </button>
            <button
              onClick={() => setFeedback('neutral')}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg min-w-[80px] min-h-[80px] transition-all ${
                feedback === 'neutral' ? 'bg-gray-200 border-2 border-gray-500' : 'bg-white border border-gray-200'
              }`}
            >
              <Meh size={32} className={feedback === 'neutral' ? 'text-gray-600' : 'text-gray-400'} />
              <span className="text-[0.8125rem]">Neutral</span>
            </button>
            <button
              onClick={() => setFeedback('confusing')}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg min-w-[80px] min-h-[80px] transition-all ${
                feedback === 'confusing' ? 'bg-red-100 border-2 border-red-500' : 'bg-white border border-gray-200'
              }`}
            >
              <Frown size={32} className={feedback === 'confusing' ? 'text-red-600' : 'text-gray-400'} />
              <span className="text-[0.8125rem]">Confusing</span>
            </button>
          </div>
        </div>
        
        {/* Share Feedback Link */}
        <div className="text-center pt-4">
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="text-[0.8125rem] text-vita-deep-blue hover:underline"
          >
            Share feedback
          </button>
        </div>
      </div>
      
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50" 
          onClick={() => setShowFeedbackModal(false)}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[1.375rem] mb-4">Which part helped you most today?</h3>
            <div className="space-y-2 mb-6">
              {['Quick tasks', 'Week preview', 'Both', 'Neither'].map((option) => (
                <label
                  key={option}
                  className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    helpfulPart === option ? 'border-vita-gold bg-amber-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="helpful"
                    checked={helpfulPart === option}
                    onChange={() => setHelpfulPart(option)}
                    className="accent-vita-gold"
                  />
                  <span className="text-[1rem]">{option}</span>
                </label>
              ))}
            </div>
            <VitaButton 
              variant="primary" 
              onClick={() => setShowFeedbackModal(false)} 
              className="w-full"
            >
              Submit
            </VitaButton>
          </div>
        </div>
      )}
    </div>
  );
}

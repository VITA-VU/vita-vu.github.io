import React, { useState, useEffect } from 'react';
import { VitaButton } from '../vita-ui/VitaButton';
import { VitaCard } from '../vita-ui/VitaCard';
import { VitaChip } from '../vita-ui/VitaChip';
import { LanguageToggle } from '../LanguageToggle';
import { Smile, Meh, Frown } from 'lucide-react';
import logo from '../imgs/VU-logo-RGB.png';
import { returnRecommendations } from '../api/requests';

interface ResultAndNextStepProps {
  //onSeeWeek: (programme: string) => void;
  onTryAnother: () => void;
  onRedo: () => void;
  currentLang: 'EN' | 'NL';
  onLangChange: (lang: 'EN' | 'NL') => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  goHome?: () => void;
  goBack?: () => void;
  selectedAvatar?: string;
}

// map avatar id -> src (used to show selected avatar speaking)
const avatarMap: Record<string, string> = (() => {
  try {
    const imgs = import.meta.glob('../imgs/avatar_griffon/*.{png,jpg,svg}', { eager: true }) as Record<string, any>;
    return Object.entries(imgs).reduce<Record<string, string>>((acc, [path, mod]) => {
      const id = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || path;
      acc[id] = mod.default || mod;
      return acc;
    }, {});
  } catch {
    return {};
  }
})();

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
  //onSeeWeek,
  onTryAnother,
  onRedo,
  currentLang,
  onLangChange,
  goBack, goHome
  , selectedAvatar
}: ResultAndNextStepProps) {
  const [feedback, setFeedback] = useState<'clear' | 'neutral' | 'confusing' | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [helpfulPart, setHelpfulPart] = useState<string>('');
  const avatarTopic = selectedAvatar || 'Griffon';
  const [programs, setPrograms] = useState<any>(null);

const loadedRef = React.useRef(false);

useEffect(() => {
  if (loadedRef.current) return;
  loadedRef.current = true;

  async function load() {
      try {
        const t = await returnRecommendations();
      const result = t.reduce((acc, item) => {
        acc[item.program] = {
          least_distance: item.least_distance,
          highest_profile: item.highest_profile,
        };
        return acc;
      }, {});

      setPrograms(result);
    } catch (err) {
      console.error("Failed to load recommendations", err);
    }
  }

  load();
}, []);

  const handleTryAnother = (program: string) => {
    localStorage.setItem('currentProgram', program)
    onTryAnother()
  };

if (!programs) {
  return <div className="p-6">Loading…</div>;
}
  
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { goHome?.(); if (typeof window !== 'undefined') { window.location.hash = '#/splash'; } }} 
            aria-label="Go home"
            className="flex items-center"
          >
            <img src={logo} alt="VU Logo" width="150" height="100" className="cursor-pointer" />
          </button>
        </div>
        <LanguageToggle currentLang={currentLang} onToggle={onLangChange} />
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">


        {/* Avatar speaking bubble (title + intro) */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-20">
            <img
              src={avatarMap[avatarTopic]}
              alt="selected avatar"
              className="object-cover rounded-full shadow"
              width="200px"
              height="100px"
            />
          </div>

          <div className="relative max-w-prose flex-1">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h2 className="text-[1.375rem] mb-2">Your matches</h2>
              <p className="text-[1rem] text-gray-600">
                Based on your responses, these programmes might be a good fit
              </p>
              <div
                style={{
                  position: 'absolute',
                  left: -8,
                  top: 24,
                  width: 16,
                  height: 16,
                  background: '#F8FAFC',
                  borderTop: '1px solid #E5E7EB',
                  borderLeft: '1px solid #E5E7EB',
                  transform: 'rotate(45deg)',
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Programme Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(programs).map(([program, idx]) => (
            <VitaCard key={program} variant="emphasis">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-[1rem]">{program}</h3>
                  {/* <VitaChip 
                    variant={match.confidence === 'High' ? 'success' : 'info'} 
                    size="small"
                  >
                    {match.confidence}
                  </VitaChip> */}
                </div>
                
{/*                 <div>
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
                </div> */}
                
                <div className="pt-3 space-y-2 mt-auto">
                  <VitaButton
                    variant="ghost"
                    onClick={() => handleTryAnother(program)}
                    className="w-full"
                  >
                    Try a task for this programme
                  </VitaButton>
                </div>
              </div>
            </VitaCard>
          ))}
        </div>
        
{/* Reflection Question */}
<div className="bg-gray-50 rounded-lg p-6 space-y-4">
  <p className="text-[1rem]">How do you feel about these recommendations?</p>

    <div className="flex gap-3 justify-center">
      {/* Happy Button */}
      <button
        onClick={() => setFeedback('clear')}
        className={`flex flex-col items-center gap-2 p-4 rounded-lg min-h-[100px] transition-all flex-1 ${
          feedback === 'clear'
            ? 'bg-green-100 border-2 border-green-500'
            : 'bg-white border border-gray-200'
        }`}
      >
        <span className="text-4xl">😊</span>
        <span className="text-[0.8125rem] text-center">
          I'm happy with my recommendations!
        </span>
      </button>

      {/* Confusing Button */}
      <button
        //TODO: call reset, go back to a different page?
        onClick={onRedo}
        className={`flex flex-col items-center gap-2 p-4 rounded-lg min-h-[100px] transition-all flex-1 ${
          feedback === 'confusing'
            ? 'bg-red-100 border-2 border-red-500'
            : 'bg-white border border-gray-200'
        }`}
      >
        <span className="text-4xl">😕</span>
        <span className="text-[0.8125rem] text-center">
          I want to keep looking
        </span>
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

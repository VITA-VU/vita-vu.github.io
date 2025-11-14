import React, { useState } from 'react';
import { VitaButton } from '../vita-ui/VitaButton';
import { VitaCard } from '../vita-ui/VitaCard';
import { LanguageToggle } from '../LanguageToggle';
import { Info } from 'lucide-react';
import logo from '../imgs/VU-logo-RGB.png';

interface ConsentAndGoalProps {

  onChoosePath: (path: 'explore' | 'help') => void;
  currentLang: 'EN' | 'NL';
  onLangChange: (lang: 'EN' | 'NL') => void;
  goHome?: () => void;
  goBack?: () => void;
}

export function ConsentAndGoal({ onChoosePath, currentLang, onLangChange, goHome }: ConsentAndGoalProps) {
  const [agreed, setAgreed] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  
  return (
    <div className="min-h-screen bg-white">
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
        </div>
        <LanguageToggle currentLang={currentLang} onToggle={onLangChange} />
      </div>
      
      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Consent Card */}
        <VitaCard>
          <p className="text-[1rem] mb-3 text-gray-700">
            We use your clicks to improve the experience. No personal decisions are made from this prototype. You can opt out at any time.
          </p>
          <p className="text-[0.8125rem] text-gray-600 mb-4">
            Your clicks are stored only for this session to improve the prototype, no personal decisions are made from this data.
          </p>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 accent-vita-gold"
            />
            <span className="text-[1rem]">I agree to continue for this session</span>
          </label>
        </VitaCard>
        
        {/* Goal Selection */}
        {agreed && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-300">
            <h2 className="text-[1.375rem]">What do you want to do today?</h2>
            
            <div className="space-y-3">
              <div data-tutorial="explore-path">
                <VitaButton
                  variant="primary"
                  onClick={() => onChoosePath('explore')}
                  className="w-full justify-start h-auto py-4"
                >
                  Explore a programme I already have in mind
                </VitaButton>
              </div>
              
              <div data-tutorial="help-path">
                <VitaButton
                  variant="primary"
                  onClick={() => onChoosePath('help')}
                  className="w-full justify-start h-auto py-4"
                >
                  Help me choose a programme
                </VitaButton>
              </div>
            </div>
            
            <button
              onClick={() => setShowOverlay(true)}
              className="flex items-center gap-2 text-[0.8125rem] text-vita-deep-blue hover:underline"
            >
              <Info size={14} />
              Learn how this works
            </button>
          </div>
        )}
      </div>
      
      {/* Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50" onClick={() => setShowOverlay(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[1.375rem] mb-4">How this works</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex gap-3">
                <span className="text-vita-gold">•</span>
                <span className="text-[1rem]">Tiny tasks help you explore programmes hands-on</span>
              </li>
              <li className="flex gap-3">
                <span className="text-vita-gold">•</span>
                <span className="text-[1rem]">Clear previews show you what a week looks like</span>
              </li>
              <li className="flex gap-3">
                <span className="text-vita-gold">•</span>
                <span className="text-[1rem]">You choose when to stop and what to try next</span>
              </li>
            </ul>
            <VitaButton variant="primary" onClick={() => setShowOverlay(false)} className="w-full">
              Got it
            </VitaButton>
          </div>
        </div>
      )}
    </div>
  );
}

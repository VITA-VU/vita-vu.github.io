import React, { useState } from 'react';
import { VitaButton } from '../vita-ui/VitaButton';
import { VitaCard } from '../vita-ui/VitaCard';
import { LanguageToggle } from '../LanguageToggle';
import logo from '../imgs/VU-logo-RGB.png';

interface ConsentAndGoalProps {
  onStart: () => void;
  currentLang: 'EN' | 'NL';
  onLangChange: (lang: 'EN' | 'NL') => void;
  goHome?: () => void;
  goBack?: () => void;
}

export function ConsentAndGoal({ onStart, currentLang, onLangChange, goHome }: ConsentAndGoalProps) {
  const [agreed, setAgreed] = useState(false);
  
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
            <img src={logo} alt="VU Logo" width="150" height="100" />
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
        
        {/* Process description + Start button */}
        {agreed && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-300">
            <h2 className="text-[1.375rem]">How the process works</h2>
            <div className="text-left text-gray-700 space-y-3">
              <p>
                You'll be guided through a short sequence of tiny, hands-on tasks that represent what will be learned in a variety of courses. 
              </p>
              <p className="text-sm text-gray-500">
                Press Start when you're ready to begin!
              </p>
            </div>

            <div className="pt-4" data-tutorial="start-button">
              <VitaButton 
                variant="primary" 
                onClick={onStart}
                className="w-full"
              >
                Start
              </VitaButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { VitaButton } from '../vita-ui/VitaButton';
import { LanguageToggle } from '../LanguageToggle';
import { TutorialToggle } from '../tutorial/TutorialToggle';

interface SplashProps {
  onStart: () => void;
  currentLang: 'EN' | 'NL';
  onLangChange: (lang: 'EN' | 'NL') => void;
  tutorialEnabled?: boolean;
  onTutorialToggle?: () => void;
}

export function Splash({ onStart, currentLang, onLangChange, tutorialEnabled = false, onTutorialToggle }: SplashProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <span className="text-vita-gold text-[1.375rem]">VITA</span>
          <span className="text-gray-400">×</span>
          <span className="text-gray-600 text-[0.875rem]">VU Amsterdam</span>
        </div>
        <div className="flex items-center gap-2">
          {onTutorialToggle && (
            <TutorialToggle enabled={tutorialEnabled} onToggle={onTutorialToggle} />
          )}
          <div data-tutorial="language-toggle">
            <LanguageToggle currentLang={currentLang} onToggle={onLangChange} />
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-[2rem] md:text-[2.5rem]">
            Find your fit, the fun way
          </h1>
          <p className="text-[1rem] text-gray-600">
            Tiny tasks, clear previews, your choice
          </p>
          <div className="pt-4" data-tutorial="start-button">
            <VitaButton 
              variant="primary" 
              onClick={onStart}
              className="w-full max-w-xs"
            >
              Start
            </VitaButton>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { VitaButton } from '../vita-ui/VitaButton';
import { VitaCard } from '../vita-ui/VitaCard';
import { LanguageToggle } from '../LanguageToggle';
import logo from '../imgs/VU-logo-RGB.png';

interface ChoosePathProps {

onChoose: (choice: 'random' | 'riasec' | 'pick-style') => void;
  currentLang: 'EN' | 'NL';
  onLangChange: (lang: 'EN' | 'NL') => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  goHome?: () => void;
  goBack?: () => void;
}

export function ChoosePath({ onChoose, currentLang, onLangChange, goBack, goHome }: ChoosePathProps) {
  const [selectedCard, setSelectedCard] = useState<'random' | 'personality' | null>(null);
  
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
      <div className="max-w-2xl mx-auto p-6 space-y-6">


        <h2 className="text-[1.375rem]">Help me choose</h2>
        
        <div className="space-y-4">
          {/* Random Task Card */}
          <div data-tutorial="random-task">
            <VitaCard
              variant={selectedCard === 'random' ? 'emphasis' : 'base'}
              onClick={() => setSelectedCard('random')}
            >
              <h3 className="text-[1rem] mb-2">I want a quick task at random</h3>
              <p className="text-[0.8125rem] text-gray-600">
                Jump right in and try a task from any programme
              </p>
            </VitaCard>
          </div>
          
          {/* Personality Card */}
          <VitaCard
            variant={selectedCard === 'personality' ? 'emphasis' : 'base'}
            onClick={() => setSelectedCard('personality')}
          >
            <h3 className="text-[1rem] mb-3">I want tasks tailored to me</h3>
            <p className="text-[0.8125rem] text-gray-600">
              Get matched to tasks based on your interests and style
            </p>
            
            {selectedCard === 'personality' && (
              <div className="space-y-2 pt-3 border-t border-gray-200">
                <div data-tutorial="riasec-path">
                  <VitaButton
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChoose('riasec');
                    }}
                    className="w-full"
                  >
                    Take a short personality quiz
                  </VitaButton>
                </div>
                <div data-tutorial="style-picker">
                  <VitaButton
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChoose('pick-style');
                    }}
                    className="w-full"
                  >
                    I already know my style, let me pick
                  </VitaButton>
                </div>
              </div>
            )}
          </VitaCard>
        </div>
        
        {selectedCard === 'random' && (
          <VitaButton
            variant="primary"
            onClick={() => onChoose('random')}
            className="w-full"
          >
            Continue
          </VitaButton>
        )}
      </div>
    </div>
  );
}

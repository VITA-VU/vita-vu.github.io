import React, { useState } from 'react';
import { VitaButton } from '../vita-ui/VitaButton';
import { VitaCard } from '../vita-ui/VitaCard';
import { LanguageToggle } from '../LanguageToggle';
import logo from '../imgs/VU-logo-RGB.png';

interface TaskIntroProps {
  selectedProgram: string;
  onContinue: () => void;
  currentLang: 'EN' | 'NL';
  onLangChange: (lang: 'EN' | 'NL') => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
}

export function TaskIntro({ selectedProgram, onContinue, currentLang, onLangChange, onGoBack, onGoHome }: TaskIntroProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { onGoHome?.(); if (typeof window !== 'undefined') { window.location.hash = '#/splash'; } }} 
            aria-label="Go home" 
            className="flex items-center"
          >
            <img src={logo} alt="VU Logo" width="150" height="100" className="cursor-pointer" />
          </button>

{/*           {onGoBack && (
            <button 
              onClick={onGoBack} 
              aria-label="Go Back"
              className="ml-3 text-sm text-vita-deep-blue hover:underline"
            >
              ← Back
            </button>
          )} */}
        </div>
        <LanguageToggle currentLang={currentLang} onToggle={onLangChange} />
      </div>
      
      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {onGoBack && (
          <button onClick={onGoBack} className="text-sm text-vita-deep-blue hover:underline mb-2 flex items-center gap-2">
            ← Back
          </button>
        )}

        {/* Heading */}
        {/* <div>
          <h1 className="text-[1.875rem] font-bold mb-4">
            You have chosen <span className="text-vita-gold">{selectedProgram}</span>
          </h1>
        </div> */}

        {/* Info Card */}
        <VitaCard>
          <div className="space-y-4">
            <div>
              <h2 className="text-[1.125rem] font-semibold mb-2">What's next?</h2>
              <p className="text-[1rem] text-gray-700 leading-relaxed">
                We'll guide you through an interactive task tailored to your interests and learning style. 
                You'll explore real-world scenarios and get personalized feedback based on your responses.
              </p>
            </div>

            <div>
              <h3 className="text-[0.875rem] font-semibold text-gray-900 mb-2">Here's what to expect:</h3>
              <ul className="space-y-2">
                <li className="text-[0.8125rem] text-gray-700 flex items-start gap-2">
                  <span className="text-vita-gold font-bold">•</span>
                  <span>An engaging task that matches your chosen programme</span>
                </li>
                <li className="text-[0.8125rem] text-gray-700 flex items-start gap-2">
                  <span className="text-vita-gold font-bold">•</span>
                  <span>Interactive elements to keep you engaged</span>
                </li>
                <li className="text-[0.8125rem] text-gray-700 flex items-start gap-2">
                  <span className="text-vita-gold font-bold">•</span>
                  <span>Instant feedback on your choices</span>
                </li>
                <li className="text-[0.8125rem] text-gray-700 flex items-start gap-2">
                  <span className="text-vita-gold font-bold">•</span>
                  <span>Insights into your strengths and learning preferences</span>
                </li>
              </ul>
            </div>
          </div>
        </VitaCard>

        {/* Continue Button */}
        <VitaButton
          variant="primary"
          onClick={onContinue}
          className="w-full"
        >
          Start Task
        </VitaButton>
      </div>
    </div>
  );
}

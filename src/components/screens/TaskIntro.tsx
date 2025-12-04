import React, { useState, useMemo } from 'react';
import { VitaButton } from '../vita-ui/VitaButton';
import { VitaCard } from '../vita-ui/VitaCard';
import { LanguageToggle } from '../LanguageToggle';
import logo from '../imgs/VU-logo-RGB.png';
import ProgressBar from '../vita-ui/ProgressBar';

interface TaskIntroProps {
  selectedProgram: string;
  onContinue: () => void;
  currentLang: 'EN' | 'NL';
  onLangChange: (lang: 'EN' | 'NL') => void;
  goHome?: () => void;
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

export function TaskIntro({selectedProgram, onContinue, currentLang, onLangChange, goHome, selectedAvatar }: TaskIntroProps) {
  const avatarTopic = selectedAvatar || 'Griffon';
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => goHome?.()} 
            aria-label="Go home" 
            className="flex items-center"
          >
            <img src={logo} alt="VU Logo" width="150" height="100" className="cursor-pointer" />
          </button>
        </div>
        <ProgressBar bgColor={"#D4a017"} progress={40} />
        <LanguageToggle currentLang={currentLang} onToggle={onLangChange} />
      </div>
      
      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 space-y-6">

        {/* Avatar speaking bubble */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-20">
              <img
                src={avatarMap[avatarTopic || '']}
                alt="selected avatar"
                className=" object-cover rounded-full shadow"
                width="200px"
                height="100px"
              />
          </div>

          <div className="relative max-w-prose flex-1">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
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
              {/* speech-tail: small rotated square positioned to point at avatar */}
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

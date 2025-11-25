import React, { useState } from 'react';
import { VitaButton } from '../vita-ui/VitaButton';
import { LanguageToggle } from '../LanguageToggle';
import logo from '../imgs/VU-logo-RGB.png';
import { updateStudent } from '../api/requests';

interface TaskFeedbackProps {
  onContinue: (stop: boolean) => void;
  currentLang: 'EN' | 'NL';
  onLangChange: (lang: 'EN' | 'NL') => void;
  goHome?: () => void;
  selectedAvatar?: string;
}

type FeedbackStep = 'enjoyment' | 'preference';

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

export function TaskFeedback({ onContinue, currentLang, onLangChange, goHome, selectedAvatar }: TaskFeedbackProps) {
  const [step, setStep] = useState<FeedbackStep>('enjoyment');
  const [enjoyment, setEnjoyment] = useState<string>('');
  const [preference, setPreference] = useState<string>('');
  const avatarTopic = selectedAvatar || 'Griffon';

  const handleEnjoymentSelect = (value: string) => {
    setEnjoyment(value);
    localStorage.setItem('taskEnjoyment', value);
    updateStudent()
    if (localStorage.getItem('stop')==='true'){
      onContinue(true);
    }
    else {
      setStep('preference');
    }
  };

  const handlePreferenceSelect = (value: string) => {
    setPreference(value);
    localStorage.setItem('taskPreference', value);
    onContinue(false);
  };

  return (
    <div className="min-h-screen bg-white">
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
      <div className="max-w-2xl mx-auto p-6 space-y-6">

        {/* Step 1: Enjoyment */}
        {step === 'enjoyment' && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-20">
                  <img
                    src={avatarMap[avatarTopic || '']}
                    alt="selected avatar"
                    className="object-cover rounded-full shadow"
                    width="200px"
                    height="100px"
                  />
              </div>

              <div className="relative max-w-prose flex-1">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <h2 className="text-[1.375rem] mb-4">How did you feel about that question?</h2>
                  <p className="text-[1rem] text-gray-600 mb-6">
                    Your feedback helps us improve your learning experience.
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <VitaButton
                variant={enjoyment === 'loved' ? 'primary' : 'ghost'}
                onClick={() => handleEnjoymentSelect('loved')}
                className="h-20 text-center flex flex-col items-center justify-center"
              >
                <span className="text-2xl mb-1">😍</span>
                <span className="text-sm">I really liked it</span>
              </VitaButton>

              <VitaButton
                variant={enjoyment === 'neutral' ? 'primary' : 'ghost'}
                onClick={() => handleEnjoymentSelect('neutral')}
                className="h-20 text-center flex flex-col items-center justify-center"
              >
                <span className="text-2xl mb-1">😐</span>
                <span className="text-sm">It was fine</span>
              </VitaButton>

              <VitaButton
                variant={enjoyment === 'disliked' ? 'primary' : 'ghost'}
                onClick={() => handleEnjoymentSelect('disliked')}
                className="h-20 text-center flex flex-col items-center justify-center"
              >
                <span className="text-2xl mb-1">😕</span>
                <span className="text-sm">I didn't really like that</span>
              </VitaButton>
            </div>
          </div>
        )}

        {/* Step 2: Preference */}
        {step === 'preference' && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-20">
                  <img
                    src={avatarMap[avatarTopic || '']}
                    alt="selected avatar"
                    className="w-20 h-20 object-cover rounded-full shadow"
                    width="200px"
                    height="100px"
                  />
              </div>

              <div className="relative max-w-prose flex-1">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <h2 className="text-[1.375rem] mb-4">What would you prefer next?</h2>
                  <p className="text-[1rem] text-gray-600 mb-6">
                    Would you like a similar type of question or something completely different?
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <VitaButton
                variant={preference === 'similar' ? 'primary' : 'ghost'}
                onClick={() => handlePreferenceSelect('similar')}
                className="h-24 flex flex-col items-center justify-center"
              >
                <span className="text-2xl mb-2">🔄</span>
                <span className="text-sm">Similar question</span>
              </VitaButton>

              <VitaButton
                variant={preference === 'new' ? 'primary' : 'ghost'}
                onClick={() => handlePreferenceSelect('new')}
                className="h-24 flex flex-col items-center justify-center"
              >
                <span className="text-2xl mb-2">✨</span>
                <span className="text-sm">Something new</span>
              </VitaButton>
            </div>

            <VitaButton
              variant="ghost"
              onClick={() => setStep('enjoyment')}
              className="w-full mt-4"
            >
              Back
            </VitaButton>
          </div>
        )}
      </div>
    </div>
  );
}
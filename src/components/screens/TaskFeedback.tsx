import React, { useState, useEffect } from 'react';
import { VitaButton } from '../vita-ui/VitaButton';
import { LanguageToggle } from '../LanguageToggle';
import logo from '../imgs/VU-logo-RGB.png';
import { returnTask } from '../api/requests';
import { useAppContext } from '../../App';
import ProgressBar from '../vita-ui/ProgressBar';

// Loading messages that rotate while waiting for API
const loadingMessages = [
  "Finding the perfect next question for you...",
  "Checking which programs match your interests...",
  "Crafting a personalized challenge...",
  "Almost there, just a moment...",
  "Preparing something interesting...",
];


interface TaskFeedbackProps {
  onContinue: (stop: boolean) => void;
  currentLang: 'EN' | 'NL';
  onLangChange: (lang: 'EN' | 'NL') => void;
  goHome?: () => void;
  selectedAvatar?: string;
}

type FeedbackStep = 'enjoyment' | 'preference';

console.log(((1.2/parseFloat(localStorage.getItem("entropy") || '3.5')))* 100);

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
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const avatarTopic = selectedAvatar || localStorage.getItem('avatar') || 'Griffon';
  const { setTask } = useAppContext(); 

  // Rotate loading messages every 2.5 seconds
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleEnjoymentSelect = async (value: string) => {
    setEnjoyment(value);
    localStorage.setItem('taskEnjoyment', value);
    setIsLoading(true);
    setLoadingMessageIndex(0);
    try {
      await returnTask('default', setTask);
      const stopValue = localStorage.getItem('stop');
      console.log('[TaskFeedback] stop value from localStorage:', stopValue, 'type:', typeof stopValue);
      if (stopValue === 'true'){
        console.log('[TaskFeedback] Navigating to results');
        onContinue(true);
      }
      else {
        // Bypass preference step - go directly to next task
        onContinue(false);
      }
    } finally {
      setIsLoading(false);
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
        <ProgressBar bgColor={"#D4a017"} progress={((1.2/parseFloat(localStorage.getItem("entropy") || '3')))* 100}/>
        <LanguageToggle currentLang={currentLang} onToggle={onLangChange} />
      </div>

      {/* Loading Screen */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
          <div className="flex-shrink-0 mb-6">
            <img
              src={avatarMap[avatarTopic || '']}
              alt="Griffon thinking"
              className="w-32 h-32 object-cover animate-pulse"
            />
          </div>
          <div className="text-center max-w-md">
            <p 
              key={loadingMessageIndex}
              className="text-lg text-gray-700 animate-fade-in"
              style={{
                animation: 'fadeInOut 2.5s ease-in-out',
              }}
            >
              {loadingMessages[loadingMessageIndex]}
            </p>
          </div>
          <style>{`
            @keyframes fadeInOut {
              0% { opacity: 0; transform: translateY(10px); }
              15% { opacity: 1; transform: translateY(0); }
              85% { opacity: 1; transform: translateY(0); }
              100% { opacity: 0; transform: translateY(-10px); }
            }
          `}</style>
        </div>
      )}

      {/* Content */}
      {!isLoading && (
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
                variant={enjoyment === '1' ? 'primary' : 'ghost'}
                onClick={() => handleEnjoymentSelect('1')}
                className="h-20 text-center flex flex-col items-center justify-center"
              >
                <span className="text-2xl mb-1">😍</span>
                <span className="text-sm">I really liked it</span>
              </VitaButton>

              <VitaButton
                variant={enjoyment === '0' ? 'primary' : 'ghost'}
                onClick={() => handleEnjoymentSelect('0')}
                className="h-20 text-center flex flex-col items-center justify-center"
              >
                <span className="text-2xl mb-1">😐</span>
                <span className="text-sm">It was fine</span>
              </VitaButton>

              <VitaButton
                variant={enjoyment === '0' ? 'primary' : 'ghost'}
                onClick={() => handleEnjoymentSelect('0')}
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
      )}
    </div>
  );
}
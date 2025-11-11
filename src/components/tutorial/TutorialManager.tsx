import React, { useState, useEffect } from 'react';
import { TutorialSpotlight } from './TutorialSpotlight';
import { tutorialSteps } from './tutorialSteps';
import { HelpCircle } from 'lucide-react';
import { VitaButton } from '../vita-ui/VitaButton';

interface TutorialManagerProps {
  currentScreen: string;
  enabled: boolean;
  onComplete?: () => void;
}

export function TutorialManager({ currentScreen, enabled, onComplete }: TutorialManagerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tutorialEnabled, setTutorialEnabled] = useState(enabled);
  const [showButton, setShowButton] = useState(false);

  const steps = tutorialSteps[currentScreen] || [];

  // Reset step when screen changes
  useEffect(() => {
    setCurrentStep(0);
  }, [currentScreen]);

  // Show help button after tutorial is completed or skipped
  useEffect(() => {
    if (!tutorialEnabled) {
      // Delay showing button to avoid flash during screen transitions
      const timer = setTimeout(() => setShowButton(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowButton(false);
    }
  }, [tutorialEnabled]);

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleSkip = () => {
    setTutorialEnabled(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleComplete = () => {
    setTutorialEnabled(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setTutorialEnabled(true);
    setShowButton(false);
  };

  if (steps.length === 0) {
    return null;
  }

  return (
    <>
      <TutorialSpotlight
        steps={steps}
        currentStep={currentStep}
        onNext={handleNext}
        onSkip={handleSkip}
        onComplete={handleComplete}
        enabled={tutorialEnabled}
      />

      {/* Help button to restart tutorial */}
      {showButton && (
        <button
          onClick={handleRestart}
          className="fixed bottom-6 right-6 z-[9997] w-12 h-12 bg-vita-gold text-white rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
          aria-label="Show tutorial"
        >
          <HelpCircle size={24} />
        </button>
      )}
    </>
  );
}

// Hook for managing tutorial state across the app
export function useTutorial(initialEnabled = false) {
  const [tutorialEnabled, setTutorialEnabled] = useState(initialEnabled);

  const startTutorial = () => setTutorialEnabled(true);
  const stopTutorial = () => setTutorialEnabled(false);
  const toggleTutorial = () => setTutorialEnabled(prev => !prev);

  return {
    tutorialEnabled,
    startTutorial,
    stopTutorial,
    toggleTutorial
  };
}

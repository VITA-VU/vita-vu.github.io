import React from 'react';
import { VitaButton } from '../vita-ui/VitaButton';
import { VitaCard } from '../vita-ui/VitaCard';
import { HelpCircle, MousePointer, Sparkles } from 'lucide-react';

interface TutorialWelcomeProps {
  onStart: () => void;
  onSkip: () => void;
  show: boolean;
}

export function TutorialWelcome({ onStart, onSkip, show }: TutorialWelcomeProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-[10001] animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        {/* Icon */}
        <div className="w-16 h-16 bg-vita-gold/10 rounded-full flex items-center justify-center mb-6 mx-auto">
          <Sparkles className="text-vita-gold" size={32} />
        </div>

        {/* Content */}
        <h2 className="text-[1.75rem] text-center mb-3">
          Welcome to VITA Discovery!
        </h2>
        
        <p className="text-[1rem] text-gray-600 text-center mb-6">
          Would you like a quick tour? We'll show you where to click and what everything does.
        </p>

        {/* Features */}
        <div className="space-y-4 mb-8">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-vita-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
              <MousePointer className="text-vita-gold" size={20} />
            </div>
            <div>
              <h3 className="text-[1rem] mb-1">Interactive Highlights</h3>
              <p className="text-[0.875rem] text-gray-600">
                We'll spotlight important buttons and features
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-vita-deep-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
              <HelpCircle className="text-vita-deep-blue" size={20} />
            </div>
            <div>
              <h3 className="text-[1rem] mb-1">Help Anytime</h3>
              <p className="text-[0.875rem] text-gray-600">
                Click the help button anytime to see the tutorial again
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <VitaButton
            variant="primary"
            onClick={onStart}
            className="w-full"
          >
            Show me around
          </VitaButton>
          
          <VitaButton
            variant="secondary"
            onClick={onSkip}
            className="w-full"
          >
            Skip tutorial
          </VitaButton>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { VitaButton } from '../vita-ui/VitaButton';
import { X, ChevronRight } from 'lucide-react';

export interface TutorialStep {
  target: string; // CSS selector for the element to highlight
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  offset?: { x: number; y: number };
}

interface TutorialSpotlightProps {
  steps: TutorialStep[];
  currentStep: number;
  onNext: () => void;
  onSkip: () => void;
  onComplete: () => void;
  enabled: boolean;
}

export function TutorialSpotlight({
  steps,
  currentStep,
  onNext,
  onSkip,
  onComplete,
  enabled
}: TutorialSpotlightProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!enabled || currentStep >= steps.length) {
      return;
    }

    const step = steps[currentStep];
    const updatePosition = () => {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);

        // Calculate tooltip position
        const position = step.position || 'bottom';
        const offset = step.offset || { x: 0, y: 0 };
        let top = 0;
        let left = 0;

        switch (position) {
          case 'top':
            top = rect.top - 160 + offset.y;
            left = rect.left + rect.width / 2 - 150 + offset.x;
            break;
          case 'bottom':
            top = rect.bottom + 16 + offset.y;
            left = rect.left + rect.width / 2 - 150 + offset.x;
            break;
          case 'left':
            top = rect.top + rect.height / 2 - 80 + offset.y;
            left = rect.left - 316 + offset.x;
            break;
          case 'right':
            top = rect.top + rect.height / 2 - 80 + offset.y;
            left = rect.right + 16 + offset.x;
            break;
        }

        setTooltipPosition({ top, left });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [currentStep, steps, enabled]);

  if (!enabled || currentStep >= steps.length) {
    return null;
  }

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* Overlay with spotlight cutout */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{
          pointerEvents: targetRect ? 'none' : 'auto',
          background: targetRect
            ? `radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${
                targetRect.top + targetRect.height / 2
              }px, transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 8}px, rgba(0, 0, 0, 0.7) ${
                Math.max(targetRect.width, targetRect.height) / 2 + 12
              }px)`
            : 'rgba(0, 0, 0, 0.7)'
        }}
      />

      {/* Pulsing ring around target */}
      {targetRect && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            borderRadius: Math.min(targetRect.width, targetRect.height) > 100 ? '12px' : '50%'
          }}
        >
          <div className="absolute inset-0 border-4 border-vita-gold rounded-[inherit] animate-[ping_2s_ease-in-out_infinite]" />
          <div className="absolute inset-0 border-4 border-vita-gold rounded-[inherit]" />
        </div>
      )}

      {/* Tooltip */}
      <div
        className="fixed z-[10000] w-[300px] pointer-events-auto"
        style={{
          top: tooltipPosition.top,
          left: Math.max(8, Math.min(tooltipPosition.left, window.innerWidth - 308))
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-gray-100">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="text-[0.75rem] text-vita-gold mb-1">
                Step {currentStep + 1} of {steps.length}
              </div>
              <h3 className="text-[1.125rem] text-gray-900">{step.title}</h3>
            </div>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors -mt-1 -mr-1"
              aria-label="Skip tutorial"
            >
              <X size={20} />
            </button>
          </div>

          {/* Description */}
          <p className="text-[0.875rem] text-gray-600 mb-4">{step.description}</p>

          {/* Progress dots */}
          <div className="flex items-center gap-1 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-6 bg-vita-gold'
                    : index < currentStep
                    ? 'w-1.5 bg-vita-gold/50'
                    : 'w-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <VitaButton
              variant="secondary"
              onClick={onSkip}
              className="flex-1"
            >
              Skip tutorial
            </VitaButton>
            <VitaButton
              variant="primary"
              onClick={isLastStep ? onComplete : onNext}
              className="flex-1 flex items-center justify-center gap-1"
            >
              {isLastStep ? 'Got it!' : 'Next'}
              {!isLastStep && <ChevronRight size={16} />}
            </VitaButton>
          </div>
        </div>

        {/* Arrow pointing to target */}
        <div
          className="absolute w-4 h-4 bg-white border-gray-100 transform rotate-45"
          style={{
            ...(step.position === 'bottom' && {
              top: -8,
              left: '50%',
              marginLeft: -8,
              borderTop: '2px solid',
              borderLeft: '2px solid'
            }),
            ...(step.position === 'top' && {
              bottom: -8,
              left: '50%',
              marginLeft: -8,
              borderBottom: '2px solid',
              borderRight: '2px solid'
            }),
            ...(step.position === 'right' && {
              left: -8,
              top: '50%',
              marginTop: -8,
              borderTop: '2px solid',
              borderLeft: '2px solid'
            }),
            ...(step.position === 'left' && {
              right: -8,
              top: '50%',
              marginTop: -8,
              borderBottom: '2px solid',
              borderRight: '2px solid'
            })
          }}
        />
      </div>
    </>
  );
}
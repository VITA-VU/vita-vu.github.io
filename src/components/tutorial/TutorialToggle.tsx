import React, { useState } from 'react';
import { Settings, HelpCircle, X } from 'lucide-react';
import { VitaButton } from '../vita-ui/VitaButton';

interface TutorialToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export function TutorialToggle({ enabled, onToggle }: TutorialToggleProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setShowMenu(true)}
        className="text-gray-500 hover:text-gray-700 transition-colors p-2"
        aria-label="Settings"
      >
        <Settings size={20} />
      </button>

      {/* Settings Menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[10000]"
          onClick={() => setShowMenu(false)}
        >
          <div 
            className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full sm:max-w-md sm:w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[1.375rem]">Settings</h3>
              <button
                onClick={() => setShowMenu(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tutorial Toggle */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-vita-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="text-vita-gold" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[1rem]">Interactive Tutorial</h4>
                    <button
                      onClick={onToggle}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        enabled ? 'bg-vita-gold' : 'bg-gray-300'
                      }`}
                      role="switch"
                      aria-checked={enabled}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[0.875rem] text-gray-600">
                    {enabled
                      ? 'Highlights and tips are enabled to guide you through the app'
                      : 'Enable to see helpful hints and highlights as you explore'}
                  </p>
                </div>
              </div>

              {enabled && (
                <div className="p-4 border border-vita-gold/30 bg-vita-gold/5 rounded-xl">
                  <p className="text-[0.875rem] text-gray-700">
                    💡 <strong>Tip:</strong> Look for the pulsing gold rings around buttons and a floating help button in the bottom-right corner.
                  </p>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="mt-6">
              <VitaButton
                variant="primary"
                onClick={() => setShowMenu(false)}
                className="w-full"
              >
                Done
              </VitaButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

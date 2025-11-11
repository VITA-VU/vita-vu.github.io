import React, { useState } from 'react';
import { VitaButton } from '../vita-ui/VitaButton';
import { VitaChip } from '../vita-ui/VitaChip';
import { LanguageToggle } from '../LanguageToggle';

interface StylePickerProps {
  onComplete: (styles: string[]) => void;
  onBack: () => void;
  currentLang: 'EN' | 'NL';
  onLangChange: (lang: 'EN' | 'NL') => void;
}

const riasecTypes = [
  { code: 'R', label: 'Realistic', description: 'Hands-on, practical work' },
  { code: 'I', label: 'Investigative', description: 'Research and analysis' },
  { code: 'A', label: 'Artistic', description: 'Creative expression' },
  { code: 'S', label: 'Social', description: 'Helping and teaching' },
  { code: 'E', label: 'Enterprising', description: 'Leading and persuading' },
  { code: 'C', label: 'Conventional', description: 'Organizing and detail work' }
];

export function StylePicker({ onComplete, onBack, currentLang, onLangChange }: StylePickerProps) {
  const [selected, setSelected] = useState<string[]>([]);
  
  const toggleSelection = (code: string) => {
    if (selected.includes(code)) {
      setSelected(selected.filter(c => c !== code));
    } else if (selected.length < 2) {
      setSelected([...selected, code]);
    }
  };
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-vita-gold text-[1.125rem]">VITA</span>
          <span className="text-gray-400 text-[0.875rem]">×</span>
          <span className="text-gray-600 text-[0.875rem]">VU Amsterdam</span>
        </div>
        <LanguageToggle currentLang={currentLang} onToggle={onLangChange} />
      </div>
      
      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-[1.375rem] mb-2">Pick your style</h2>
          <p className="text-[1rem] text-gray-600">
            Select up to two styles that best describe you
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {riasecTypes.map((type) => (
            <button
              key={type.code}
              onClick={() => toggleSelection(type.code)}
              className={`p-4 border-2 rounded-lg text-left transition-all min-h-[100px] ${
                selected.includes(type.code)
                  ? 'border-vita-gold bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[1.125rem]">{type.code}</span>
                {selected.includes(type.code) && (
                  <div className="w-2 h-2 bg-vita-gold rounded-full"></div>
                )}
              </div>
              <div className="text-[1rem] mb-1">{type.label}</div>
              <div className="text-[0.8125rem] text-gray-600">{type.description}</div>
            </button>
          ))}
        </div>
        
        <div className="flex gap-3">
          <VitaButton variant="ghost" onClick={onBack}>
            Back
          </VitaButton>
          <VitaButton
            variant="primary"
            onClick={() => onComplete(selected)}
            disabled={selected.length === 0}
            className="flex-1"
          >
            Continue
          </VitaButton>
        </div>
      </div>
    </div>
  );
}

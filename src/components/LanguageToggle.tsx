import React from 'react';

interface LanguageToggleProps {
  currentLang: 'EN' | 'NL';
  onToggle: (lang: 'EN' | 'NL') => void;
}

export function LanguageToggle({ currentLang, onToggle }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onToggle('EN')}
        className={`px-3 py-1 text-[0.8125rem] rounded transition-colors min-w-[44px] min-h-[32px] ${
          currentLang === 'EN' 
            ? 'bg-white text-vita-near-black shadow-sm' 
            : 'text-gray-600 hover:text-vita-near-black'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onToggle('NL')}
        className={`px-3 py-1 text-[0.8125rem] rounded transition-colors min-w-[44px] min-h-[32px] ${
          currentLang === 'NL' 
            ? 'bg-white text-vita-near-black shadow-sm' 
            : 'text-gray-600 hover:text-vita-near-black'
        }`}
      >
        NL
      </button>
    </div>
  );
}

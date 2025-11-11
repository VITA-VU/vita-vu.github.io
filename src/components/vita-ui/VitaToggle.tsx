import React from 'react';

interface VitaToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function VitaToggle({ checked, onChange, label }: VitaToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div 
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-vita-gold' : 'bg-gray-300'
        }`}
        onClick={() => onChange(!checked)}
      >
        <div 
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </div>
      {label && <span className="text-[1rem]">{label}</span>}
    </label>
  );
}

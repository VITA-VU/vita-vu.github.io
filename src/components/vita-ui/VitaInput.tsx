import React from 'react';

type InputType = 'text' | 'number' | 'email';

interface VitaInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  caption?: string;
  inputType?: InputType;
}

export function VitaInput({ 
  label, 
  caption, 
  inputType = 'text',
  className = '',
  ...props 
}: VitaInputProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-[1rem] text-vita-near-black">
          {label}
        </label>
      )}
      <input
        type={inputType}
        className="min-h-[44px] px-4 py-2 bg-input-background border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vita-gold focus:border-transparent"
        {...props}
      />
      {caption && (
        <span className="text-[0.8125rem] text-muted-foreground">
          {caption}
        </span>
      )}
    </div>
  );
}

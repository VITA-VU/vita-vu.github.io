import React from 'react';

interface VitaSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  caption?: string;
  options: { value: string; label: string }[];
}

export function VitaSelect({ 
  label, 
  caption, 
  options,
  className = '',
  ...props 
}: VitaSelectProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-[1rem] text-vita-near-black">
          {label}
        </label>
      )}
      <select
        className="min-h-[44px] px-4 py-2 bg-input-background border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vita-gold focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724%27 height=%2724%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23666%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-[center_right_1rem]"
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {caption && (
        <span className="text-[0.8125rem] text-muted-foreground">
          {caption}
        </span>
      )}
    </div>
  );
}

import React from 'react';

type ChipVariant = 'info' | 'warning' | 'success';
type ChipSize = 'small' | 'medium';

interface VitaChipProps {
  variant?: ChipVariant;
  size?: ChipSize;
  children: React.ReactNode;
}

export function VitaChip({ variant = 'info', size = 'medium', children }: VitaChipProps) {
  const sizeStyles = {
    small: "px-2 py-1 text-[0.75rem]",
    medium: "px-3 py-1.5 text-[0.8125rem]"
  };
  
  const variantStyles = {
    info: "bg-blue-100 text-blue-800 border border-blue-200",
    warning: "bg-amber-100 text-amber-800 border border-amber-200",
    success: "bg-green-100 text-green-800 border border-green-200"
  };
  
  return (
    <span className={`inline-flex items-center rounded-full ${sizeStyles[size]} ${variantStyles[variant]}`}>
      {children}
    </span>
  );
}

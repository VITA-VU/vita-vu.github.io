import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface VitaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

export function VitaButton({ 
  variant = 'primary', 
  children, 
  className = '',
  disabled,
  ...props 
}: VitaButtonProps) {
  const baseStyles = "min-h-[44px] px-6 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-vita-gold focus:ring-offset-2";
  
  const variantStyles = {
    primary: "bg-vita-gold text-vita-near-black border-2 border-vita-gold hover:bg-[#C39215] hover:border-[#C39215] active:bg-[#B38413] active:border-[#B38413] disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed",
    secondary: "bg-transparent text-vita-deep-blue border-2 border-vita-deep-blue hover:bg-vita-deep-blue/10 active:bg-vita-deep-blue/20 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed",
    ghost: "bg-transparent text-vita-near-black border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
  };
  
  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
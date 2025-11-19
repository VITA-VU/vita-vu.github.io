import React from 'react';

type CardVariant = 'base' | 'emphasis';

interface VitaCardProps {
  variant?: CardVariant;
  withHeader?: boolean;
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function VitaCard({ 
  variant = 'base', 
  withHeader = false,
  header,
  children,
  className = '',
  onClick
}: VitaCardProps) {
  const variantStyles = {
    base: "bg-white border border-gray-200",
    emphasis: "bg-vita-gold border-2 border-vita-gold shadow-sm"
  };
  
  return (
    <div 
      className={`rounded-lg p-4 ${variantStyles[variant]} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
      style={variant === 'emphasis' ? { borderColor: 'rgba(212,160,23,1)' } : undefined}

    >
      {withHeader && header && (
        <div className="mb-3 pb-3 border-b border-gray-100">
          {header}
        </div>
      )}
      {children}
    </div>
  );
}

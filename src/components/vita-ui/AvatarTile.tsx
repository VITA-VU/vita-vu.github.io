import React from 'react';

interface AvatarTileProps {
  illustration: React.ReactNode;
  title: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function AvatarTile({ illustration, title, isSelected = false, onClick }: AvatarTileProps) {
  return (
    <div
      className={`relative aspect-square rounded-lg p-3 cursor-pointer transition-all ${
        isSelected 
          ? 'bg-vita-gold border-2 border-vita-gold shadow-md' 
          : 'bg-white border border-gray-300 hover:border-vita-gold hover:shadow-sm'
      }`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <div className="flex-1 flex items-center justify-center">
          {illustration}
        </div>
        <span className={`text-[0.75rem] text-center ${isSelected ? 'text-white' : 'text-vita-near-black'}`}>
          {title}
        </span>
      </div>
    </div>
  );
}

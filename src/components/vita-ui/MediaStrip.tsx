import React from 'react';
import { Play, FileText, HelpCircle } from 'lucide-react';

interface MediaItem {
  type: 'video' | 'document' | 'faq';
  caption: string;
  thumbnail?: string;
}

interface MediaStripProps {
  items: MediaItem[];
}

export function MediaStrip({ items }: MediaStripProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play size={24} />;
      case 'document': return <FileText size={24} />;
      case 'faq': return <HelpCircle size={24} />;
      default: return null;
    }
  };
  
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {items.map((item, index) => (
        <div key={index} className="flex-shrink-0 w-32">
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 mb-2 cursor-pointer hover:border-vita-gold transition-colors">
            <div className="text-vita-deep-blue">
              {getIcon(item.type)}
            </div>
          </div>
          <p className="text-[0.8125rem] text-center text-vita-near-black">
            {item.caption}
          </p>
        </div>
      ))}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimerPillProps {
  seconds?: number;
  onComplete?: () => void;
}

export function TimerPill({ seconds = 90, onComplete }: TimerPillProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);
  
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-full">
      <Clock size={14} className="text-vita-near-black" />
      <span className="text-[0.8125rem]">{timeLeft}s</span>
    </div>
  );
}

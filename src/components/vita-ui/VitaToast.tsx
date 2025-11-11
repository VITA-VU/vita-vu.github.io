import React, { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface VitaToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  duration?: number;
}

export function VitaToast({ message, show, onClose, duration = 2000 }: VitaToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);
  
  if (!show) return null;
  
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom">
      <div className="bg-vita-near-black text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[200px]">
        <CheckCircle2 size={18} className="text-green-400" />
        <span className="text-[0.875rem] flex-1">{message}</span>
        <button onClick={onClose} className="text-white/70 hover:text-white">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState({ show: false, message: '' });
  
  const showToast = (message: string) => {
    setToast({ show: true, message });
  };
  
  const hideToast = () => {
    setToast({ show: false, message: '' });
  };
  
  return { toast, showToast, hideToast };
}

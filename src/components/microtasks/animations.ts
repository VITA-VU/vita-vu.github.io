// Shared Framer Motion animation variants for microtasks

import { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

export const dragItem: Variants = {
  idle: { scale: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  dragging: { scale: 1.02, boxShadow: '0 8px 20px rgba(0,0,0,0.15)', zIndex: 50 },
  dropped: { scale: 1, transition: { type: 'spring', stiffness: 300 } },
};

export const optionSelect: Variants = {
  idle: { scale: 1, borderColor: '#e5e7eb' },
  selected: { 
    scale: 1, 
    borderColor: '#C4A747',
    transition: { duration: 0.2 } 
  },
  hover: { 
    scale: 1.01, 
    borderColor: '#d1d5db',
    transition: { duration: 0.1 } 
  },
};

export const correctAnswer: Variants = {
  initial: { scale: 1 },
  correct: {
    scale: [1, 1.03, 1],
    backgroundColor: ['#ffffff', '#d1fae5', '#d1fae5'],
    borderColor: ['#e5e7eb', '#10b981', '#10b981'],
    transition: { duration: 0.4 },
  },
};

export const incorrectAnswer: Variants = {
  initial: { scale: 1 },
  incorrect: {
    x: [0, -4, 4, -4, 4, 0],
    backgroundColor: ['#ffffff', '#fee2e2', '#fee2e2'],
    borderColor: ['#e5e7eb', '#ef4444', '#ef4444'],
    transition: { duration: 0.4 },
  },
};

export const staggerChildren: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export const pulseOnce: Variants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.3 },
  },
};

export const bucketHighlight: Variants = {
  idle: { 
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  active: { 
    backgroundColor: '#fef3c7',
    borderColor: '#C4A747',
    transition: { duration: 0.15 },
  },
};

export const chartBarGrow: Variants = {
  hidden: { scaleY: 0, originY: 1 },
  visible: (i: number) => ({
    scaleY: 1,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
  }),
};

export const balanceScale: Variants = {
  balanced: { rotate: 0 },
  tiltLeft: { rotate: -10, transition: { type: 'spring', stiffness: 100 } },
  tiltRight: { rotate: 10, transition: { type: 'spring', stiffness: 100 } },
};

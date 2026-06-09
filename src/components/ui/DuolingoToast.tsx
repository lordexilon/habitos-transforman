'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface DuolingoToastProps {
  message: string;
  type: 'success' | 'warning' | 'passive-aggressive';
  isOpen: boolean;
  onClose: () => void;
}

export default function DuolingoToast({ message, type, isOpen, onClose }: DuolingoToastProps) {
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    setVisible(isOpen);
    if (isOpen) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!visible) return null;

  const bgColors = {
    'success': 'bg-green-500 border-green-600',
    'warning': 'bg-yellow-500 border-yellow-600',
    'passive-aggressive': 'bg-rose-500 border-rose-600'
  };

  const mascotExpression = {
    'success': '😎',
    'warning': '🤔',
    'passive-aggressive': '🦉'
  };

  return (
    <div className={`fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-80 p-4 rounded-xl border-b-4 text-white shadow-xl transform transition-all duration-300 animate-slide-up z-50 flex items-start gap-3 ${bgColors[type]}`}>
      <div className="text-3xl">{mascotExpression[type]}</div>
      <div className="flex-1 pt-1 font-bold text-sm leading-snug">
        {message}
      </div>
      <button onClick={() => { setVisible(false); onClose(); }} className="text-white/80 hover:text-white">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

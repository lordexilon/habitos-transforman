'use client';

import React from 'react';
import { Lock, Sparkles, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PaywallModalProps {
  isOpen: boolean;
  type: 'register' | 'paywall';
  title: string;
  description: string;
  onClose: () => void;
}

export default function PaywallModal({ isOpen, type, title, description, onClose }: PaywallModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform transition-all animate-slide-up">
        <div className={`p-8 text-white flex flex-col items-center justify-center text-center relative ${
          type === 'register' ? 'bg-indigo-600' : 'bg-emerald-600'
        }`}>
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 backdrop-blur-md relative z-10 border border-white/30">
            {type === 'register' ? (
              <UserPlus className="w-8 h-8 text-white" />
            ) : (
              <Lock className="w-8 h-8 text-white" />
            )}
          </div>
          <h2 className="text-2xl font-black relative z-10">{title}</h2>
        </div>
        
        <div className="p-6 text-center">
          <p className="text-gray-600 font-medium leading-relaxed mb-6">
            {description}
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={() => {
                onClose();
                router.push('/auth');
              }}
              className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                type === 'register' 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              {type === 'register' ? 'Crear Cuenta Gratis' : 'Desbloquear Acceso'}
            </button>
            <button 
              onClick={onClose}
              className="w-full font-bold py-3.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Quizás más tarde
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

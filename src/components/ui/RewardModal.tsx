'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Home } from 'lucide-react';

interface RewardModalProps {
  isOpen: boolean;
  pointsEarned: number;
  onClose: () => void;
  nextModuleHref?: string;
  nextModuleLabel?: string;
}

export default function RewardModal({ isOpen, pointsEarned, onClose, nextModuleHref, nextModuleLabel }: RewardModalProps) {
  const router = useRouter();
  if (!isOpen) return null;

  const handleNext = () => {
    onClose();
    if (nextModuleHref) router.push(nextModuleHref);
  };

  const handleHome = () => {
    onClose();
    router.push('/');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="text-7xl mb-4 animate-bounce">🏆</div>
        <h2 className="text-3xl font-black text-gray-800 mb-2">¡Módulo Completado!</h2>
        <p className="text-gray-500 mb-5 font-medium leading-snug">Tu compromiso con el sistema de hábitos está dando frutos.</p>
        
        <div className="bg-yellow-50 border-2 border-yellow-300 text-yellow-600 font-black text-4xl py-4 rounded-2xl mb-6 shadow-inner">
          +{pointsEarned} XP
        </div>

        {/* ¿Qué sigue? */}
        <div className="text-left mb-5 bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
          <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3">¿Qué sigue?</p>
          {nextModuleHref && nextModuleLabel ? (
            <button
              onClick={handleNext}
              className="w-full flex items-center justify-between bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md mb-2"
            >
              <span>{nextModuleLabel}</span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </button>
          ) : (
            <p className="text-sm text-indigo-700 font-semibold text-center py-2">
              🎉 ¡Has completado todos los módulos! Eres un campeón de los hábitos.
            </p>
          )}
          <button
            onClick={handleHome}
            className="w-full flex items-center justify-between text-gray-500 font-semibold py-2 px-4 rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
          >
            <span>Volver al inicio</span>
            <Home className="w-4 h-4 shrink-0" />
          </button>
        </div>

        <button 
          onClick={onClose}
          className="w-full text-gray-400 text-sm font-medium py-2 hover:text-gray-600 transition-colors"
        >
          Quedarme aquí
        </button>
      </div>
    </div>
  );
}

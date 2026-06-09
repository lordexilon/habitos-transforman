'use client';

import React, { useEffect, useState } from 'react';
import Logo from '@/components/ui/Logo';

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Solo mostrar el Splash Screen si es la primera vez que abre la pestaña
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    
    if (hasSeenSplash) {
      setShow(false);
      return;
    }

    sessionStorage.setItem('hasSeenSplash', 'true');

    // Empezar a desvanecer a los 2 segundos
    const timer1 = setTimeout(() => setFade(true), 1500);
    // Remover completamente a los 2.5 segundos
    const timer2 = setTimeout(() => setShow(false), 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="animate-pulse">
        <Logo className="w-24 h-24" showText={true} />
      </div>
      <div className="mt-12 text-sm font-medium text-gray-400 tracking-widest uppercase">
        Optimizando...
      </div>
    </div>
  );
}

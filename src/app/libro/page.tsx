'use client';

import React from 'react';
import BottomNav from '@/components/layout/BottomNav';
import { BookOpen, Lock } from 'lucide-react';

export default function LibroPage() {
  // Deshabilitar menú contextual
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans select-none" onContextMenu={handleContextMenu}>
      <div className="bg-indigo-900 px-6 pt-12 pb-6 rounded-b-3xl shadow-sm mb-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-black flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-300" /> Mi Biblioteca
          </h1>
          <Lock className="w-4 h-4 text-indigo-400 opacity-50" />
        </div>
        <p className="text-indigo-200 font-medium text-sm">Contenido exclusivo protegido.</p>
      </div>

      <div className="px-6 space-y-6">
        
        {/* Índice o Capítulos Simulados */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-full -z-10" />
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Capítulo 1: La anatomía del Hábito</h2>
          
          <div className="text-gray-700 space-y-4 leading-relaxed font-serif">
            <p>
              El éxito es el producto de los hábitos diarios, no de las transformaciones de una vez en la vida.
              La mayoría de la gente cree que necesita cambiarlo todo de la noche a la mañana, pero la realidad es que
              un 1% de mejora cada día equivale a un cambio monumental a largo plazo.
            </p>
            <p>
              Nuestro cerebro siempre busca ahorrar energía. Por eso creamos rutinas automáticas. 
              Si logramos entender cómo se construye la "Señal, Rutina y Recompensa", tendremos el código fuente
              de nuestra propia mente.
            </p>
            <div className="bg-indigo-50 p-4 rounded-xl border-l-4 border-indigo-500 italic my-6 text-indigo-900">
              "Tus hábitos son la curva de interés compuesto de la superación personal."
            </div>
            <p>
              Para erradicar un mal hábito, primero debes observar qué emoción lo detona. A veces comemos no porque
              tengamos hambre, sino porque estamos estresados o aburridos.
            </p>
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}

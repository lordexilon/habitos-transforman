'use client';

import React, { useState, useEffect } from 'react';
import BottomNav from '@/components/layout/BottomNav';
import { BookOpen, Lock, Unlock, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

const BOOK_CHAPTERS = [
  {
    id: 1,
    title: "Introducción: El poder de los hábitos",
    requiredPoints: 0,
    content: (
      <div className="space-y-4">
        <p>
          Bienvenido a Hábitos Poderosos. Este libro no es solo teoría, es un manual de operaciones para tu cerebro.
          Estás a punto de descubrir por qué haces lo que haces y, lo más importante, cómo cambiarlo.
        </p>
        <p>
          Si estás leyendo esto, es porque ya has dado el primer paso. Tienes tu cuenta, tienes tu Agenda y
          tienes a tu Coach. Eso es todo lo que necesitas.
        </p>
      </div>
    )
  },
  {
    id: 2,
    title: "Capítulo 1: La anatomía del Hábito",
    requiredPoints: 50,
    content: (
      <div className="space-y-4">
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
        <div className="bg-indigo-50 p-4 rounded-xl border-l-4 border-indigo-500 italic my-6 text-indigo-900 font-serif">
          "Tus hábitos son la curva de interés compuesto de la superación personal."
        </div>
        <p>
          Para erradicar un mal hábito, primero debes observar qué emoción lo detona. A veces comemos no porque
          tengamos hambre, sino porque estamos estresados o aburridos.
        </p>
      </div>
    )
  },
  {
    id: 3,
    title: "Capítulo 2: Reemplazo Neuronal",
    requiredPoints: 150,
    content: (
      <div className="space-y-4">
        <p>
          Una vez que identificas la señal, no puedes simplemente eliminar el hábito. Debes reemplazar la rutina
          pero mantener la recompensa. Así es como engañamos al cerebro.
        </p>
        <p>
          Sigue interactuando con el Coach para descubrir las técnicas avanzadas de reemplazo de dopamina.
        </p>
      </div>
    )
  }
];

export default function LibroPage() {
  const { session } = useAuth();
  const [points, setPoints] = useState(0);
  const [openChapter, setOpenChapter] = useState<number | null>(1);

  useEffect(() => {
    const userId = session?.user?.id || 'guest';
    const currentPoints = Number(localStorage.getItem(`user_points_${userId}`) || '0');
    setPoints(currentPoints);
  }, [session]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const toggleChapter = (chapterId: number, isLocked: boolean) => {
    if (isLocked) return;
    setOpenChapter(openChapter === chapterId ? null : chapterId);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans select-none" onContextMenu={handleContextMenu}>
      {/* Header */}
      <div className="bg-indigo-900 px-6 pt-12 pb-6 rounded-b-3xl shadow-sm mb-6 text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 opacity-10">
          <BookOpen className="w-48 h-48" />
        </div>
        <div className="flex items-center justify-between mb-2 relative z-10">
          <h1 className="text-2xl font-black flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-300" /> Mi Biblioteca
          </h1>
          <div className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <Star className="w-4 h-4" /> {points}
          </div>
        </div>
        <p className="text-indigo-200 font-medium text-sm relative z-10">Desbloquea capítulos ganando puntos.</p>
      </div>

      <div className="px-4 space-y-4">
        {BOOK_CHAPTERS.map((chapter) => {
          const isLocked = points < chapter.requiredPoints;
          const isOpen = openChapter === chapter.id && !isLocked;
          
          return (
            <div 
              key={chapter.id} 
              className={`bg-white rounded-2xl shadow-sm border transition-all ${
                isLocked ? 'border-gray-200 opacity-90' : isOpen ? 'border-indigo-300 shadow-md' : 'border-gray-100 cursor-pointer hover:border-indigo-200'
              }`}
            >
              {/* Chapter Header */}
              <div 
                className={`p-5 flex items-center justify-between ${!isLocked ? 'cursor-pointer' : ''}`}
                onClick={() => toggleChapter(chapter.id, isLocked)}
              >
                <div className="flex items-center gap-3">
                  {isLocked ? (
                    <div className="bg-gray-100 p-2 rounded-full">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                  ) : (
                    <div className="bg-indigo-50 p-2 rounded-full">
                      <Unlock className="w-5 h-5 text-indigo-500" />
                    </div>
                  )}
                  <div>
                    <h2 className={`font-bold ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                      {chapter.title}
                    </h2>
                    {isLocked && (
                      <p className="text-xs font-bold text-orange-500 mt-0.5 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Requiere {chapter.requiredPoints} pts
                      </p>
                    )}
                  </div>
                </div>
                {!isLocked && (
                  <div>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-indigo-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                )}
              </div>

              {/* Chapter Content */}
              {isOpen && (
                <div className="px-5 pb-5 pt-2 border-t border-gray-50 animate-fade-in">
                  <div className="text-gray-700 leading-relaxed font-serif text-[15px]">
                    {chapter.content}
                  </div>
                </div>
              )}

              {/* Locked Preview / Teaser */}
              {isLocked && (
                <div className="px-5 pb-5">
                  <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center text-center border border-dashed border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Sigue completando tu Agenda Diaria o habla con tu Coach para ganar puntos.
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div 
                        className="bg-orange-400 h-2.5 rounded-full transition-all" 
                        style={{ width: `${Math.min(100, (points / chapter.requiredPoints) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">
                      Faltan {chapter.requiredPoints - points} puntos
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}

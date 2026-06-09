'use client';
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cleanCitations } from '@/lib/cleanCitations';

interface TheoryCardProps {
  title: string;
  content: string;
  image?: string;
}

// Limpia las referencias del PDF [cite: X] del texto
const cleanText = (text: string) =>
  text.replace(/\[cite:\s*\d+\]/g, '').replace(/\s{2,}/g, ' ').trim();

// Formatea texto con negritas simples (**texto**) a JSX
const formatRichText = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-extrabold text-indigo-950">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

export default function TheoryCard({ title, content, image }: TheoryCardProps) {
  // Dividir por párrafos (saltos de línea dobles). Si no los hay, por oraciones.
  const rawChunks = content.includes('\n\n') 
    ? content.split(/\n\n+/) 
    : (content.match(/[^\.!\?]+[\.!\?]+/g) || [content]);
  const chunks = rawChunks.map(cleanCitations).filter(c => c.trim().length > 3);

  const [currentIndex, setCurrentIndex] = useState(0);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === chunks.length - 1;

  const handleNext = () => !isLast && setCurrentIndex(i => i + 1);
  const handlePrev = () => !isFirst && setCurrentIndex(i => i - 1);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
      {/* Barra de progreso Stories */}
      <div className="flex gap-1 px-5 pt-4">
        {chunks.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              i < currentIndex ? 'bg-indigo-500' :
              i === currentIndex ? 'bg-indigo-300' : 'bg-gray-100'
            }`}
          />
        ))}
      </div>

      {/* Contador */}
      <div className="flex justify-between items-center px-5 pt-2">
        <h2 className="text-sm font-black text-indigo-600 uppercase tracking-wider truncate pr-4">{cleanCitations(title)}</h2>
        <span className="text-xs font-bold text-gray-400 shrink-0">{currentIndex + 1} / {chunks.length}</span>
      </div>

      {/* Contenido — solo esta zona avanza al siguiente al hacer tap */}
      <div
        className="min-h-[220px] flex flex-col items-center justify-center gap-4 text-center px-6 py-8 cursor-pointer select-none active:scale-[0.99] transition-transform"
        onClick={handleNext}
      >
        {image && (
          <div className="w-24 h-24 shrink-0 relative animate-fade-in mb-1">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full rounded-2xl object-cover shadow-md border border-gray-100 bg-gray-50" 
            />
          </div>
        )}
        <div className="text-gray-800 font-semibold leading-relaxed text-base md:text-lg max-w-sm whitespace-pre-line">
          {formatRichText(chunks[currentIndex])}
        </div>
      </div>

      {/* Navegación — stopPropagation para no activar el onClick del contenedor */}
      {isLast ? (
        /* Estado final: tarjeta completada */
        <div className="border-t-2 border-emerald-100 bg-emerald-50 flex items-center justify-between px-5 py-3.5 rounded-b-3xl">
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="flex items-center gap-1 text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
            <span className="text-base">✅</span>
            <span>¡Lección lista! Pulsa Continuar</span>
            <span className="animate-bounce text-base">↓</span>
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-100 flex">
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            disabled={isFirst}
            className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          <div className="w-px bg-gray-100" />

          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { cleanCitations } from '@/lib/cleanCitations';

interface HabitRoutineInputProps {
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
}

export default function HabitRoutineInput({ title, description, value, onChange }: HabitRoutineInputProps) {
  return (
    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 mb-6">
      <h3 className="text-lg font-bold text-emerald-900 mb-2">{cleanCitations(title)}</h3>
      <p className="text-emerald-800 text-sm mb-4">{cleanCitations(description)}</p>
      
      <textarea
        placeholder="Ej. Voy a leer una página de un libro..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full p-3 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white resize-none"
      />
    </div>
  );
}

import React, { useState } from 'react';
import { cleanCitations } from '@/lib/cleanCitations';

interface HabitRewardInputProps {
  title: string;
  description: string;
  suggestedRewards?: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function HabitRewardInput({ title, description, suggestedRewards, value, onChange }: HabitRewardInputProps) {
  const [customInput, setCustomInput] = useState('');

  const formatText = (text: string) => cleanCitations(text);

  return (
    <div className="bg-rose-50 p-6 rounded-2xl border border-rose-200 mb-6">
      <h3 className="text-lg font-bold text-rose-900 mb-2">{cleanCitations(title)}</h3>
      <p className="text-rose-800 text-sm mb-4">{cleanCitations(description)}</p>
      
      <div className="space-y-4">
        {suggestedRewards && suggestedRewards.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-rose-800 mb-2">Ideas de recompensas:</h4>
            <div className="flex flex-wrap gap-2">
              {suggestedRewards.map((item, idx) => {
                const cleanText = formatText(item);
                return (
                  <button
                    key={idx}
                    onClick={() => onChange(cleanText)}
                    className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                      value === cleanText 
                        ? 'bg-rose-600 text-white border-rose-600' 
                        : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-100'
                    }`}
                  >
                    {cleanText}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-rose-800 mb-2">O escribe tu propia recompensa:</h4>
          <input
            type="text"
            placeholder="Ej. Me diré: '¡Excelente trabajo!'"
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              onChange(e.target.value);
            }}
            className="w-full p-3 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
          />
        </div>
      </div>
    </div>
  );
}

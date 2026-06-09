import React, { useState } from 'react';

interface SubstituteHabitSelectorProps {
  title: string;
  description: string;
  suggestedSubstitutes?: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function SubstituteHabitSelector({ title, description, suggestedSubstitutes, value, onChange }: SubstituteHabitSelectorProps) {
  const [customInput, setCustomInput] = useState('');

  return (
    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200 mb-6">
      <h3 className="text-lg font-bold text-orange-900 mb-2">{title}</h3>
      <p className="text-orange-800 text-sm mb-4">{description}</p>
      
      <div className="space-y-4">
        {suggestedSubstitutes && suggestedSubstitutes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-orange-800 mb-2">Sustitutos Saludables:</h4>
            <div className="flex flex-wrap gap-2">
              {suggestedSubstitutes.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onChange(item)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    value === item 
                      ? 'bg-orange-600 text-white border-orange-600 shadow-md' 
                      : 'bg-white text-orange-700 border-orange-300 hover:bg-orange-100'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-orange-800 mb-2">O escribe tu propio sustituto:</h4>
          <input
            type="text"
            placeholder="Ej. Leer un capítulo de un libro"
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              onChange(e.target.value);
            }}
            className="w-full p-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          />
        </div>
      </div>
    </div>
  );
}

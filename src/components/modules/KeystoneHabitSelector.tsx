import React, { useState } from 'react';

interface KeystoneHabitSelectorProps {
  title: string;
  description: string;
  suggestedKeystones?: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function KeystoneHabitSelector({ title, description, suggestedKeystones, value, onChange }: KeystoneHabitSelectorProps) {
  const [customInput, setCustomInput] = useState('');

  return (
    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-200 mb-6">
      <h3 className="text-lg font-bold text-indigo-900 mb-2">{title}</h3>
      <p className="text-indigo-800 text-sm mb-4">{description}</p>
      
      <div className="space-y-4">
        {suggestedKeystones && suggestedKeystones.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-indigo-800 mb-2">Hábitos clave sugeridos:</h4>
            <div className="flex flex-wrap gap-2">
              {suggestedKeystones.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onChange(item)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    value === item 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-100'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-indigo-800 mb-2">O escribe tu propio hábito clave:</h4>
          <input
            type="text"
            placeholder="Ej. Leer 10 páginas diarias"
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              onChange(e.target.value);
            }}
            className="w-full p-3 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>
    </div>
  );
}

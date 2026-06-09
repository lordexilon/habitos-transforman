import React, { useState } from 'react';

interface ScheduleBuilderProps {
  title: string;
  description: string;
  suggestedFrequencies?: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function ScheduleBuilder({ title, description, suggestedFrequencies, value, onChange }: ScheduleBuilderProps) {
  const [customInput, setCustomInput] = useState('');

  return (
    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 mb-6">
      <h3 className="text-lg font-bold text-emerald-900 mb-2">{title}</h3>
      <p className="text-emerald-800 text-sm mb-4">{description}</p>
      
      <div className="space-y-4">
        {suggestedFrequencies && suggestedFrequencies.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-emerald-800 mb-2">Horarios sugeridos:</h4>
            <div className="flex flex-wrap gap-2">
              {suggestedFrequencies.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onChange(item)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    value === item 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-emerald-800 mb-2">O escribe tu propio horario:</h4>
          <input
            type="text"
            placeholder="Ej. Todos los sábados a las 10am"
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              onChange(e.target.value);
            }}
            className="w-full p-3 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
      </div>
    </div>
  );
}

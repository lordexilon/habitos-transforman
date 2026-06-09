import React, { useState } from 'react';

interface BadHabitAnalyzerProps {
  title: string;
  description: string;
  causes?: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function BadHabitAnalyzer({ title, description, causes, value, onChange }: BadHabitAnalyzerProps) {
  const [customInput, setCustomInput] = useState('');

  return (
    <div className="bg-rose-50 p-6 rounded-2xl border border-rose-200 mb-6">
      <h3 className="text-lg font-bold text-rose-900 mb-2">{title}</h3>
      <p className="text-rose-800 text-sm mb-4">{description}</p>
      
      <div className="space-y-4">
        {causes && causes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-rose-800 mb-2">Posibles Causas:</h4>
            <div className="flex flex-col gap-2">
              {causes.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onChange(item)}
                  className={`text-sm px-4 py-2 rounded-xl border transition-colors text-left ${
                    value === item 
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md' 
                      : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-100'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-rose-800 mb-2">O describe el estrés/aburrimiento específico:</h4>
          <textarea
            placeholder="Ej. Me siento aburrido cuando..."
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              onChange(e.target.value);
            }}
            rows={2}
            className="w-full p-3 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white resize-none"
          />
        </div>
      </div>
    </div>
  );
}

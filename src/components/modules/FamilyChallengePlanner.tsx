import React, { useState } from 'react';

interface FamilyChallengePlannerProps {
  title: string;
  description: string;
  suggestedChallenges?: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function FamilyChallengePlanner({ title, description, suggestedChallenges, value, onChange }: FamilyChallengePlannerProps) {
  const [customInput, setCustomInput] = useState('');

  return (
    <div className="bg-cyan-50 p-6 rounded-2xl border border-cyan-200 mb-6">
      <h3 className="text-lg font-bold text-cyan-900 mb-2">{title}</h3>
      <p className="text-cyan-800 text-sm mb-4">{description}</p>
      
      <div className="space-y-4">
        {suggestedChallenges && suggestedChallenges.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-cyan-800 mb-2">Ideas de Retos:</h4>
            <div className="flex flex-wrap gap-2">
              {suggestedChallenges.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onChange(item)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    value === item 
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-md' 
                      : 'bg-white text-cyan-700 border-cyan-300 hover:bg-cyan-100'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-cyan-800 mb-2">O inventa el tuyo propio:</h4>
          <input
            type="text"
            placeholder="Ej. Torneo de saltos de cuerda el domingo"
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              onChange(e.target.value);
            }}
            className="w-full p-3 rounded-xl border border-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
          />
        </div>
      </div>
    </div>
  );
}

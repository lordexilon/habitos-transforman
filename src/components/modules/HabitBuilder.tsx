import React, { useState } from 'react';
import { cleanCitations } from '@/lib/cleanCitations';

interface HabitBuilderProps {
  title: string;
  description: string;
  suggestedList1?: string[];
  suggestedList2?: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function HabitBuilder({ title, description, suggestedList1, suggestedList2, value, onChange }: HabitBuilderProps) {
  const [customInput, setCustomInput] = useState('');

  const formatText = (text: string) => cleanCitations(text);

  return (
    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200 mb-6">
      <h3 className="text-lg font-bold text-blue-900 mb-2">{title}</h3>
      <p className="text-blue-800 text-sm mb-4">{description.replace(/\[cite:\s*\d+\]/g, '')}</p>
      
      <div className="space-y-4">
        {suggestedList1 && suggestedList1.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Cosas que haces sin falta:</h4>
            <div className="flex flex-wrap gap-2">
              {suggestedList1.map((item, idx) => {
                const cleanText = formatText(item);
                return (
                  <button
                    key={idx}
                    onClick={() => onChange(cleanText)}
                    className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                      value === cleanText 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-100'
                    }`}
                  >
                    {cleanText}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {suggestedList2 && suggestedList2.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Cosas que te suceden:</h4>
            <div className="flex flex-wrap gap-2">
              {suggestedList2.map((item, idx) => {
                const cleanText = formatText(item);
                return (
                  <button
                    key={idx}
                    onClick={() => onChange(cleanText)}
                    className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                      value === cleanText 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-100'
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
          <h4 className="text-sm font-semibold text-blue-800 mb-2">O escribe tu propio recordatorio:</h4>
          <input
            type="text"
            placeholder="Ej. Cuando me levanto de la cama..."
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              onChange(e.target.value);
            }}
            className="w-full p-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>
    </div>
  );
}

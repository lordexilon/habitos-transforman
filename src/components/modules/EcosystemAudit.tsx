import React, { useState } from 'react';

interface EcosystemAuditProps {
  title: string;
  description: string;
  ecosystemAreas?: string[];
  value: string[];
  onChange: (value: string[]) => void;
}

export default function EcosystemAudit({ title, description, ecosystemAreas, value, onChange }: EcosystemAuditProps) {
  const toggleArea = (area: string) => {
    if (value.includes(area)) {
      onChange(value.filter(a => a !== area));
    } else {
      onChange([...value, area]);
    }
  };

  return (
    <div className="bg-teal-50 p-6 rounded-2xl border border-teal-200 mb-6">
      <h3 className="text-lg font-bold text-teal-900 mb-2">{title}</h3>
      <p className="text-teal-800 text-sm mb-4">{description}</p>
      
      <div className="space-y-4">
        {ecosystemAreas && ecosystemAreas.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-teal-800 mb-3">Áreas de tu ecosistema (Selecciona las que necesitan mejora):</h4>
            <div className="flex flex-col gap-3">
              {ecosystemAreas.map((item, idx) => {
                const isSelected = value.includes(item);
                return (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer" onClick={() => toggleArea(item)}>
                    <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-teal-600 border-teal-600' : 'bg-white border-teal-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${isSelected ? 'text-teal-900 font-semibold' : 'text-teal-700'}`}>
                      {item}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

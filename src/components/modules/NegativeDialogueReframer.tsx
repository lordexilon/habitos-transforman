import React from 'react';

interface NegativeDialogueReframerProps {
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
}

export default function NegativeDialogueReframer({ title, description, value, onChange }: NegativeDialogueReframerProps) {
  return (
    <div className="bg-purple-50 p-6 rounded-2xl border border-purple-200 mb-6">
      <h3 className="text-lg font-bold text-purple-900 mb-2">{title}</h3>
      <p className="text-purple-800 text-sm mb-4">{description}</p>
      
      <div className="space-y-3">
        <textarea
          placeholder="Ej. 'Soy un desastre...' PERO 'estoy aprendiendo a crear mejores hábitos.'"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white resize-none"
        />
        {value && (
          <p className="text-xs text-purple-700 italic">¡Excelente! El poder del "pero" detiene el espiral negativo.</p>
        )}
      </div>
    </div>
  );
}

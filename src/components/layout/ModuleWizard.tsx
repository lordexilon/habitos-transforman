'use client';
import React, { useState } from 'react';

interface ModuleWizardProps {
  children: React.ReactNode;
  onComplete: () => void;
  isSaving: boolean;
  moduleImage: string;
  moduleTitle: string;
  canComplete?: boolean; // Prop to disable completion if fields are empty
}

export default function ModuleWizard({ children, onComplete, isSaving, moduleImage, moduleTitle, canComplete = true }: ModuleWizardProps) {
  const steps = React.Children.toArray(children).filter(child => React.isValidElement(child));
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (canComplete) {
        onComplete();
      } else {
        alert("Por favor, completa los campos requeridos antes de finalizar.");
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] bg-gray-50 pb-8">
      {/* Header with Generated Image */}
      <div className="bg-white rounded-b-3xl shadow-sm mb-6 overflow-hidden">
        <div className="relative w-full h-56 bg-indigo-50 flex items-center justify-center">
          <img 
            src={moduleImage} 
            alt={moduleTitle}
            className="w-full h-full object-cover opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <h2 className="absolute bottom-4 left-6 right-6 text-3xl font-black text-white drop-shadow-lg leading-tight">
            {moduleTitle}
          </h2>
        </div>
        
        {/* Progress Bar */}
        <div className="px-6 py-5 flex items-center gap-4">
          <div className="text-sm font-bold text-gray-500 whitespace-nowrap uppercase tracking-wider">
            Paso {currentStep + 1} de {steps.length}
          </div>
          <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500 ease-out rounded-full shadow-sm"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 flex-1 animate-fade-in">
        {steps[currentStep]}
      </div>

      {/* Bottom Actions */}
      <div className="mt-8 px-4 flex gap-3">
        {currentStep > 0 && (
          <button 
            onClick={handlePrev}
            className="px-6 py-4 rounded-xl font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 active:scale-95 transition-all shadow-sm"
          >
            Atrás
          </button>
        )}
        
        <button 
          onClick={handleNext}
          disabled={isSaving || (currentStep === steps.length - 1 && !canComplete)}
          className="flex-1 bg-indigo-600 text-white font-black text-lg py-4 rounded-xl shadow-md hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {isSaving ? 'Guardando...' : (currentStep === steps.length - 1 ? '¡Completar y Ganar XP!' : 'Continuar')}
        </button>
      </div>
    </div>
  );
}

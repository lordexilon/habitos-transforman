'use client';

import React, { useState } from 'react';
import moduleData from '../../../content/03-erradicacion.json';
import TheoryCard from '@/components/modules/TheoryCard';
import BadHabitAnalyzer from '@/components/modules/BadHabitAnalyzer';
import SubstituteHabitSelector from '@/components/modules/SubstituteHabitSelector';
import NegativeDialogueReframer from '@/components/modules/NegativeDialogueReframer';
import { createClient } from '@/lib/supabase/client';
import RewardModal from '@/components/ui/RewardModal';
import ModuleWizard from '@/components/layout/ModuleWizard';
import AICoachFeedback from '@/components/ui/AICoachFeedback';

export default function ErradicacionYReemplazo() {
  const [habitState, setHabitState] = useState({
    cause: '',
    substitute: '',
    reframe: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  const [showReward, setShowReward] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('user_habits').insert({
      module_id: 3,
      habit_data: habitState
    });
    setIsSaving(false);
    if (!error) {
      const newPoints = Number(localStorage.getItem('user_points') || '0') + 50;
      const newStreak = Number(localStorage.getItem('user_streak') || '0') + 1;
      localStorage.setItem('user_points', newPoints.toString());
      localStorage.setItem('user_streak', newStreak.toString());
      window.dispatchEvent(new Event('pointsUpdated'));
      setShowReward(true);
    } else {
      alert("Error al guardar: " + error.message);
    }
  };

  const renderSection = (section: any) => {
    if (section.type === 'theory') {
      return (
        <TheoryCard 
          key={section.id} 
          title={section.title} 
          content={section.content} 
          image={section.image}
        />
      );
    }

    if (section.type === 'interactive_node') {
      if (section.component === 'BadHabitAnalyzer') {
        return (
          <BadHabitAnalyzer 
            key={section.id}
            title={section.title}
            description={section.description}
            causes={section.props.causes}
            value={habitState.cause}
            onChange={(val) => setHabitState({ ...habitState, cause: val })}
          />
        );
      }

      if (section.component === 'SubstituteHabitSelector') {
        return (
          <SubstituteHabitSelector 
            key={section.id}
            title={section.title}
            description={section.description}
            suggestedSubstitutes={section.props.suggested_substitutes}
            value={habitState.substitute}
            onChange={(val) => setHabitState({ ...habitState, substitute: val })}
          />
        );
      }

      if (section.component === 'NegativeDialogueReframer') {
        return (
          <NegativeDialogueReframer 
            key={section.id}
            title={section.title}
            description={section.description}
            value={habitState.reframe}
            onChange={(val) => setHabitState({ ...habitState, reframe: val })}
          />
        );
      }
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <ModuleWizard
        onComplete={handleSave}
        isSaving={isSaving}
        moduleImage="/images/erradicacion.png"
        moduleTitle={moduleData.title}
        canComplete={Boolean(habitState.cause && habitState.substitute && habitState.reframe)}
      >
        {moduleData.sections.map(renderSection)}

        {/* Resumen final */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Tu Plan de Erradicación</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="bg-rose-100 text-rose-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Causa del Mal Hábito</p>
                <p className="text-gray-800 font-medium text-lg line-through opacity-70">{habitState.cause || 'Falta definir'}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="bg-emerald-100 text-emerald-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sustituto Saludable</p>
                <p className="text-gray-800 font-medium text-lg">{habitState.substitute || 'Falta definir'}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nuevo Diálogo (Poder del "Pero")</p>
                <p className="text-gray-800 font-medium text-lg">{habitState.reframe || 'Falta definir'}</p>
              </div>
            </div>
          </div>
          
          <AICoachFeedback habitData={habitState} />
        </div>
      </ModuleWizard>
      <RewardModal isOpen={showReward} pointsEarned={50} onClose={() => setShowReward(false)} nextModuleHref="/ecosistema-vida-sana" nextModuleLabel="Módulo 4: Ecosistema de Vida Sana" />
    </div>
  );
}

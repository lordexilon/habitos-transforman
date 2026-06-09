'use client';

import React, { useState } from 'react';
import moduleData from '../../../content/02-sistemas.json';
import TheoryCard from '@/components/modules/TheoryCard';
import ScheduleBuilder from '@/components/modules/ScheduleBuilder';
import KeystoneHabitSelector from '@/components/modules/KeystoneHabitSelector';
import { createClient } from '@/lib/supabase/client';
import RewardModal from '@/components/ui/RewardModal';
import ModuleWizard from '@/components/layout/ModuleWizard';
import AICoachFeedback from '@/components/ui/AICoachFeedback';

export default function SistemasVsMetas() {
  const [habitState, setHabitState] = useState({
    schedule: '',
    keystone: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  const [showReward, setShowReward] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('user_habits').insert({
      module_id: 2,
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
      if (section.component === 'ScheduleBuilder') {
        return (
          <ScheduleBuilder 
            key={section.id}
            title={section.title}
            description={section.description}
            suggestedFrequencies={section.props.suggested_frequencies}
            value={habitState.schedule}
            onChange={(val) => setHabitState({ ...habitState, schedule: val })}
          />
        );
      }

      if (section.component === 'KeystoneHabitSelector') {
        return (
          <KeystoneHabitSelector 
            key={section.id}
            title={section.title}
            description={section.description}
            suggestedKeystones={section.props.suggested_keystones}
            value={habitState.keystone}
            onChange={(val) => setHabitState({ ...habitState, keystone: val })}
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
        moduleImage="/images/sistemas_metas.png"
        moduleTitle={moduleData.title}
        canComplete={Boolean(habitState.schedule && habitState.keystone)}
      >
        {moduleData.sections.map(renderSection)}

        {/* Resumen del hábito construido */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Tu Sistema Diseñado</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="bg-emerald-100 text-emerald-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Horario Definido</p>
                <p className="text-gray-800 font-medium text-lg">{habitState.schedule || 'Falta definir'}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hábito Clave</p>
                <p className="text-gray-800 font-medium text-lg">{habitState.keystone || 'Falta definir'}</p>
              </div>
            </div>
          </div>
          
          <AICoachFeedback habitData={habitState} />
        </div>
      </ModuleWizard>
      <RewardModal isOpen={showReward} pointsEarned={50} onClose={() => setShowReward(false)} nextModuleHref="/erradicacion-y-reemplazo" nextModuleLabel="Módulo 3: Erradicación y Reemplazo" />
    </div>
  );
}

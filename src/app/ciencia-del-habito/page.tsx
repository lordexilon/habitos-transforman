'use client';

import React, { useState } from 'react';
import moduleData from '../../../content/01-como-funcionan.json';
import TheoryCard from '@/components/modules/TheoryCard';
import HabitBuilder from '@/components/modules/HabitBuilder';
import HabitRoutineInput from '@/components/modules/HabitRoutineInput';
import HabitRewardInput from '@/components/modules/HabitRewardInput';
import { createClient } from '@/lib/supabase/client';
import RewardModal from '@/components/ui/RewardModal';
import ModuleWizard from '@/components/layout/ModuleWizard';
import AICoachFeedback from '@/components/ui/AICoachFeedback';

export default function CienciaDelHabito() {
  const [habitState, setHabitState] = useState({
    trigger: '',
    routine: '',
    reward: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  const [showReward, setShowReward] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('user_habits').insert({
      module_id: 1,
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
      if (section.component === 'HabitBuilder') {
        return (
          <HabitBuilder 
            key={section.id}
            title={section.title}
            description={section.description}
            suggestedList1={section.props.suggested_triggers_list_1}
            suggestedList2={section.props.suggested_triggers_list_2}
            value={habitState.trigger}
            onChange={(val) => setHabitState({ ...habitState, trigger: val })}
          />
        );
      }

      if (section.component === 'HabitRoutineInput') {
        return (
          <HabitRoutineInput 
            key={section.id}
            title={section.title}
            description={section.description}
            value={habitState.routine}
            onChange={(val) => setHabitState({ ...habitState, routine: val })}
          />
        );
      }

      if (section.component === 'HabitRewardInput') {
        return (
          <HabitRewardInput 
            key={section.id}
            title={section.title}
            description={section.description}
            suggestedRewards={section.props.suggested_rewards}
            value={habitState.reward}
            onChange={(val) => setHabitState({ ...habitState, reward: val })}
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
        moduleImage="/images/ciencia_habito.png"
        moduleTitle={moduleData.title}
        canComplete={Boolean(habitState.trigger && habitState.routine && habitState.reward)}
      >
        {moduleData.sections.map(renderSection)}

        {/* Resumen final */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Tu Nuevo Hábito</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Señal</p>
                <p className="text-gray-800 font-medium text-lg">{habitState.trigger || 'Falta definir'}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="bg-emerald-100 text-emerald-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rutina</p>
                <p className="text-gray-800 font-medium text-lg">{habitState.routine || 'Falta definir'}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="bg-rose-100 text-rose-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recompensa</p>
                <p className="text-gray-800 font-medium text-lg">{habitState.reward || 'Falta definir'}</p>
              </div>
            </div>
          </div>
          
          <AICoachFeedback habitData={habitState} />
        </div>
      </ModuleWizard>
      <RewardModal isOpen={showReward} pointsEarned={50} onClose={() => setShowReward(false)} nextModuleHref="/sistemas-vs-metas" nextModuleLabel="Módulo 2: Sistemas vs Metas" />
    </div>
  );
}

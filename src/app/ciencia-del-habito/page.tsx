'use client';
import React, { useState, useEffect } from 'react';
import TheoryCard from '@/components/modules/TheoryCard';
import HabitBuilder from '@/components/modules/HabitBuilder';
import HabitRoutineInput from '@/components/modules/HabitRoutineInput';
import HabitRewardInput from '@/components/modules/HabitRewardInput';
import { createClient } from '@/lib/supabase/client';
import RewardModal from '@/components/ui/RewardModal';
import ModuleWizard from '@/components/layout/ModuleWizard';
import AICoachFeedback from '@/components/ui/AICoachFeedback';
import { useAuth } from '@/components/providers/AuthProvider';

export default function CienciaDelHabito() {
  const { session } = useAuth();
  const userId = session?.user?.id || 'guest';

  const [habitState, setHabitState] = useState({
    trigger: '',
    routine: '',
    reward: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [moduleData, setModuleData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClient();
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    async function loadDynamicModule() {
      setIsLoading(true);
      try {
        const userPoints = Number(localStorage.getItem(`user_points_${userId}`) || '0');
        const res = await fetch('/api/modules/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleId: 1, points: userPoints })
        });
        if (res.ok) {
          const data = await res.json();
          setModuleData(data.moduleData);
        } else {
          throw new Error("Failed to load generated module data");
        }
      } catch (err) {
        console.error("Fallo cargando módulo dinámico:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (session !== undefined) {
      loadDynamicModule();
    }
  }, [session, userId]);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('user_habits').insert({
      module_id: 1,
      habit_data: habitState
    });
    setIsSaving(false);
    if (!error) {
      const newPoints = Number(localStorage.getItem(`user_points_${userId}`) || '0') + 50;
      const newStreak = Number(localStorage.getItem(`user_streak_${userId}`) || '0') + 1;
      localStorage.setItem(`user_points_${userId}`, newPoints.toString());
      localStorage.setItem(`user_streak_${userId}`, newStreak.toString());
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
            suggestedList1={section.props?.suggested_triggers_list_1 || []}
            suggestedList2={section.props?.suggested_triggers_list_2 || []}
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
            suggestedRewards={section.props?.suggested_rewards || []}
            value={habitState.reward}
            onChange={(val) => setHabitState({ ...habitState, reward: val })}
          />
        );
      }
    }
    
    return null;
  };

  if (isLoading || !moduleData) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            <span className="absolute inset-0 flex items-center justify-center text-2xl">🧠</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-800 mb-1">Estructurando tu lección</h3>
            <p className="text-xs font-semibold text-gray-400 max-w-xs mx-auto leading-relaxed animate-pulse">
              Tu Coach de IA está analizando tu nivel y adaptando el contenido basándose en el libro...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const userPoints = typeof window !== 'undefined' ? Number(localStorage.getItem(`user_points_${userId}`) || '0') : 0;
  const visibleSections = moduleData.sections?.filter((section: any) => {
    return !('minPoints' in section) || userPoints >= (section as any).minPoints;
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <ModuleWizard
        onComplete={handleSave}
        isSaving={isSaving}
        moduleImage="/images/ciencia_habito.png"
        moduleTitle={moduleData.title}
        canComplete={Boolean(habitState.trigger && habitState.routine && habitState.reward)}
      >
        {visibleSections.map(renderSection)}

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

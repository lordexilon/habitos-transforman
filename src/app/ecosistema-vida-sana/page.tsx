'use client';

import React, { useState } from 'react';
import moduleData from '../../../content/04-ecosistema.json';
import TheoryCard from '@/components/modules/TheoryCard';
import EcosystemAudit from '@/components/modules/EcosystemAudit';
import FamilyChallengePlanner from '@/components/modules/FamilyChallengePlanner';
import { createClient } from '@/lib/supabase/client';
import RewardModal from '@/components/ui/RewardModal';
import ModuleWizard from '@/components/layout/ModuleWizard';
import AICoachFeedback from '@/components/ui/AICoachFeedback';

export default function EcosistemaVidaSana() {
  const [habitState, setHabitState] = useState({
    auditAreas: [] as string[],
    challenge: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  const [showReward, setShowReward] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('user_habits').insert({
      module_id: 4,
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
      if (section.component === 'EcosystemAudit') {
        return (
          <EcosystemAudit 
            key={section.id}
            title={section.title}
            description={section.description}
            ecosystemAreas={section.props.ecosystem_areas}
            value={habitState.auditAreas}
            onChange={(val) => setHabitState({ ...habitState, auditAreas: val })}
          />
        );
      }

      if (section.component === 'FamilyChallengePlanner') {
        return (
          <FamilyChallengePlanner 
            key={section.id}
            title={section.title}
            description={section.description}
            suggestedChallenges={section.props.suggested_challenges}
            value={habitState.challenge}
            onChange={(val) => setHabitState({ ...habitState, challenge: val })}
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
        moduleImage="/images/ecosistema.png"
        moduleTitle={moduleData.title}
        canComplete={Boolean(habitState.auditAreas.length > 0 && habitState.challenge)}
      >
        {moduleData.sections.map(renderSection)}

        {/* Resumen final */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Auditoría del Ecosistema</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="bg-yellow-100 text-yellow-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Áreas de Auditoría</p>
                <p className="text-gray-800 font-medium text-lg">{habitState.auditAreas.join(', ') || 'Falta definir'}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reto Familiar</p>
                <p className="text-gray-800 font-medium text-lg">{habitState.challenge || 'Falta definir'}</p>
              </div>
            </div>
          </div>
          
          <AICoachFeedback habitData={habitState} />
        </div>
      </ModuleWizard>
      <RewardModal isOpen={showReward} pointsEarned={50} onClose={() => setShowReward(false)} />
    </div>
  );
}

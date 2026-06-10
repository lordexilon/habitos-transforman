'use client';

import React, { useState } from 'react';
import { Sparkles, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

interface WeeklyEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedTasksCount: number;
  totalTasksCount: number;
  challengeTitle: string;
  challengePoints: number;
  onSuccess: () => void;
}

export default function WeeklyEvaluationModal({
  isOpen,
  onClose,
  completedTasksCount,
  totalTasksCount,
  challengeTitle,
  challengePoints,
  onSuccess
}: WeeklyEvaluationModalProps) {
  const { session } = useAuth();
  const userId = session?.user?.id || 'guest';

  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<{
    score: number;
    feedback: string;
    nextChallengeSuggestion: string;
  } | null>(null);
  const [isClaimed, setIsClaimed] = useState(false);

  if (!isOpen) return null;

  const handleStartEvaluation = async () => {
    setIsLoading(true);
    try {
      const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 70;
      
      const res = await fetch('/api/coach/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeTitle,
          completionRate,
          completedCount: completedTasksCount,
          totalCount: totalTasksCount
        })
      });

      if (res.ok) {
        const data = await res.json();
        setEvaluation(data.evaluation);
      } else {
        throw new Error("Failed to evaluate");
      }
    } catch (e) {
      console.error(e);
      // Fallback estático amigable si falla la API
      setEvaluation({
        score: 85,
        feedback: "¡Has hecho un gran esfuerzo esta semana! Integrar nuevos hábitos requiere paciencia. Mantener tu racha activa demuestra tu disciplina. Sigue así y la curva de interés compuesto de tu mejora personal se hará notar.",
        nextChallengeSuggestion: "Tu siguiente ruta recomendada es enfocarte en el sueño reparador (Desafío: Noches sin Pantallas)."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimPoints = () => {
    setIsClaimed(true);
    const currentPoints = Number(localStorage.getItem(`user_points_${userId}`) || '0');
    const newPoints = currentPoints + challengePoints;
    localStorage.setItem(`user_points_${userId}`, newPoints.toString());
    window.dispatchEvent(new Event('pointsUpdated'));

    // Disparar la autogeneración automática del nuevo contenido de los 4 módulos en segundo plano
    if (userId !== 'guest') {
      console.log("🔄 Autogenerando nuevo contenido para los 4 módulos (Nivel actualizado)...");
      fetch('/api/modules/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId: 1, points: newPoints })
      }).catch(err => {
        console.error("Fallo al autogenerar módulos en segundo plano:", err);
      });
    }

    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in border border-indigo-50">
        
        {/* Header decorativo */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-6 text-white text-center relative">
          <Sparkles className="w-12 h-12 text-indigo-200 mx-auto mb-3 animate-pulse" />
          <h2 className="text-2xl font-black tracking-tight">Evaluación de IA Semanal</h2>
          <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider mt-1">Tu Coach analiza tu progreso</p>
        </div>

        {/* Contenido principal */}
        <div className="p-6">
          {!evaluation ? (
            <div className="space-y-6 text-center">
              <p className="text-gray-600 text-sm leading-relaxed">
                ¡Es viernes por la noche! Tu Coach de IA ha preparado una retrospectiva de tu rendimiento basado en tu agenda y el reto de esta semana:
              </p>
              
              <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl text-left">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-1">Reto Activo</span>
                <p className="text-indigo-950 font-bold text-base leading-tight mb-2">{challengeTitle}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 font-bold">
                  <span>Tareas hechas: {completedTasksCount}/{totalTasksCount}</span>
                  <span className="text-emerald-600 font-black">+{challengePoints} XP en juego</span>
                </div>
              </div>

              <button
                onClick={handleStartEvaluation}
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analizando tu semana...
                  </>
                ) : (
                  <>
                    Iniciar Evaluación Semanal
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              
              <button onClick={onClose} className="text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors">
                Evaluar más tarde
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score Circular */}
              <div className="flex items-center gap-5 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-indigo-600 flex flex-col items-center justify-center text-white shrink-0 shadow-md">
                  <span className="text-xs font-black opacity-80 leading-none">SCORE</span>
                  <span className="text-lg font-black leading-none mt-0.5">{evaluation.score}</span>
                </div>
                <div>
                  <h4 className="font-black text-gray-800 text-sm">Rendimiento Semanal</h4>
                  <p className="text-xs font-bold text-indigo-600 mt-0.5">
                    {evaluation.score >= 80 ? '🏆 ¡Excelente constancia!' : evaluation.score >= 50 ? '🌱 Vas por buen camino' : '💪 ¡Podemos mejorar la racha!'}
                  </p>
                </div>
              </div>

              {/* Feedback */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Feedback del Coach</span>
                  <p className="text-gray-700 font-medium text-sm leading-relaxed bg-indigo-50/30 p-4 rounded-2xl border border-indigo-50/50">
                    {evaluation.feedback}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider block mb-1">Tu Ruta para la Siguiente Semana</span>
                  <p className="text-gray-800 font-bold text-xs bg-orange-50/50 p-3.5 rounded-xl border border-orange-100/50 leading-snug">
                    {evaluation.nextChallengeSuggestion}
                  </p>
                </div>
              </div>

              {/* Botón Reclamar */}
              {!isClaimed ? (
                <button
                  onClick={handleClaimPoints}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-lg"
                >
                  <Trophy className="w-6 h-6 text-yellow-200" />
                  Reclamar +{challengePoints} XP
                </button>
              ) : (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-center font-bold text-sm">
                  ✓ ¡Puntos reclamados y ruta guardada!
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

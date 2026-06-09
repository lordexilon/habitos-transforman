'use client';
import React, { useState } from 'react';
import { Sparkles, Brain, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

interface CoachFeedback {
  score: number;
  strengths: string[];
  improvement: string;
  proposal: string;
}

interface AICoachFeedbackProps {
  habitData: any;
  onAnalysisComplete?: (score: number) => void;
}

export default function AICoachFeedback({ habitData, onAnalysisComplete }: AICoachFeedbackProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<CoachFeedback | null>(null);

  const analyzeHabit = async () => {
    setIsAnalyzing(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habitData)
      });
      const data = await res.json();
      setFeedback(data);
      if (onAnalysisComplete) onAnalysisComplete(data.score);
    } catch (error) {
      console.error(error);
      alert('Error conectando con el Coach IA');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full mt-6 mb-2">
      {!feedback && !isAnalyzing && (
        <button 
          onClick={analyzeHabit}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white py-3 px-4 rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
        >
          <Sparkles className="w-5 h-5" />
          <span>Analizar con IA Coach</span>
        </button>
      )}

      {isAnalyzing && (
        <div className="w-full bg-violet-50 border border-violet-100 rounded-xl p-8 flex flex-col items-center justify-center animate-pulse">
          <Brain className="w-10 h-10 text-violet-400 animate-bounce mb-4" />
          <p className="text-violet-700 font-bold text-sm tracking-wide">El Coach está analizando tu diseño...</p>
        </div>
      )}

      {feedback && !isAnalyzing && (
        <div className="w-full bg-white border-2 border-violet-100 rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in relative overflow-hidden">
          {/* Fondo decorativo */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-bl-full -z-10 opacity-50" />
          
          {/* Header con Score */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2 text-violet-600">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-black text-lg">Veredicto IA</h3>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-black shadow-sm ${
              feedback.score >= 80 ? 'bg-emerald-100 text-emerald-700' : 
              feedback.score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {feedback.score} / 100 XP
            </div>
          </div>

          {/* Strengths */}
          {feedback.strengths && feedback.strengths.length > 0 && (
            <div className="space-y-2.5 pt-1">
              {feedback.strengths.map((str, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="font-medium leading-tight">{str}</span>
                </div>
              ))}
            </div>
          )}

          {/* Improvement */}
          {feedback.improvement && (
            <div className="flex items-start gap-3 bg-orange-50/80 p-3.5 rounded-xl border border-orange-100/50">
              <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-sm text-orange-800 font-semibold leading-snug">
                {feedback.improvement}
              </p>
            </div>
          )}

          {/* Proposal */}
          {feedback.proposal && (
            <div className="flex items-start gap-3 bg-gradient-to-br from-indigo-50 to-violet-50 p-4 rounded-xl border border-indigo-100/50">
              <Lightbulb className="w-6 h-6 text-indigo-500 shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1.5">El Coach Propone</p>
                <p className="text-sm text-indigo-900 font-bold italic leading-relaxed">"{feedback.proposal}"</p>
              </div>
            </div>
          )}

          <button 
            onClick={analyzeHabit}
            className="w-full mt-4 text-violet-400 text-xs font-black uppercase tracking-wider hover:text-violet-600 transition-colors py-2"
          >
            Re-evaluar nuevo diseño
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import BottomNav from '@/components/layout/BottomNav';
import DuolingoToast from '@/components/ui/DuolingoToast';
import { BookOpen, CheckCircle2, Circle, Flame, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import PaywallModal from '@/components/ui/PaywallModal';

type Task = {
  id: string;
  task: string;
  time: string;
  category: string;
  completed: boolean;
};

export default function AgendaPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'passive-aggressive'>('success');
  const [showToast, setShowToast] = useState(false);
  const [pillRead, setPillRead] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
  useEffect(() => {
    const userId = session?.user?.id || 'guest';
    const savedAgenda = localStorage.getItem(`user_agenda_${userId}`);
    if (savedAgenda) {
      setTasks(JSON.parse(savedAgenda));
    } else {
      // Mock para testeo si no hay agenda
      setTasks([
        { id: '1', task: 'Tomar 2 vasos de agua', time: 'Mañana', category: 'dieta', completed: false },
        { id: '2', task: 'Leer 10 páginas del ebook', time: 'Tarde', category: 'lectura', completed: false }
      ]);
    }
    
    const userId = session?.user?.id || 'guest';
    const read = localStorage.getItem(`pill_read_today_${userId}`);
    if (read) setPillRead(true);
  }, [session]);

  const triggerToast = (type: 'success' | 'passive-aggressive', message: string) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
  };

  const toggleTask = (id: string) => {
    if (!session) {
      setShowPaywall(true);
      return;
    }

    const newTasks = tasks.map(t => {
      if (t.id === id) {
        const isCompleting = !t.completed;
        if (isCompleting) {
          triggerToast('success', '¡Eso es! Un paso más cerca de tu meta. 🔥');
          // Add points
          const userId = session?.user?.id || 'guest';
          const currentPoints = Number(localStorage.getItem(`user_points_${userId}`) || '0');
          localStorage.setItem(`user_points_${userId}`, (currentPoints + 10).toString());
          window.dispatchEvent(new Event('pointsUpdated'));
        } else {
          triggerToast('passive-aggressive', '¿En serio lo desmarcaste? No me hagas decepcionarme. 🦉');
        }
        return { ...t, completed: isCompleting };
      }
      return t;
    });
    const userId = session?.user?.id || 'guest';
    setTasks(newTasks);
    localStorage.setItem(`user_agenda_${userId}`, JSON.stringify(newTasks));
  };

  const completePill = () => {
    if (!session) {
      setShowPaywall(true);
      return;
    }

    const userId = session?.user?.id || 'guest';
    setPillRead(true);
    localStorage.setItem(`pill_read_today_${userId}`, 'true');
    const currentPoints = Number(localStorage.getItem(`user_points_${userId}`) || '0');
    localStorage.setItem(`user_points_${userId}`, (currentPoints + 25).toString());
    window.dispatchEvent(new Event('pointsUpdated'));
    triggerToast('success', '¡Sabiduría absorbida! +25 puntos. 🧠');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <div className="bg-white px-6 pt-12 pb-6 rounded-b-3xl shadow-sm mb-6">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Tu Día</h1>
        <p className="text-gray-500 font-medium">Conquista tus hábitos uno por uno.</p>
      </div>

      <div className="px-6 space-y-8">
        
        {/* Píldora Diaria */}
        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Píldora de Hoy
          </h2>
          <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
            <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-white opacity-10" />
            <p className="font-medium text-lg leading-snug mb-4 relative z-10">
              "El éxito es el producto de los hábitos diarios, no de las transformaciones de una vez en la vida."
            </p>
            {!pillRead ? (
              <button onClick={completePill} className="bg-white text-indigo-600 font-bold px-4 py-2 rounded-full text-sm hover:bg-indigo-50 transition-colors w-full">
                Lo he leído
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 bg-indigo-800/30 font-bold px-4 py-2 rounded-full text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Leído y asimilado
              </div>
            )}
          </div>
        </section>

        {/* Lista de Tareas */}
        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" /> Agenda Gamificada
          </h2>
          
          <div className="space-y-3">
            {tasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => toggleTask(task.id)}
                className={`bg-white p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                  task.completed ? 'border-emerald-500 bg-emerald-50/50 opacity-70' : 'border-gray-100 hover:border-indigo-200'
                }`}
              >
                <div className="shrink-0">
                  {task.completed ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                  ) : (
                    <Circle className="w-7 h-7 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-lg ${task.completed ? 'text-emerald-900 line-through' : 'text-gray-800'}`}>
                    {task.task}
                  </h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      {task.time}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                      {task.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      <DuolingoToast 
        isOpen={showToast} 
        message={toastMessage} 
        type={toastType} 
        onClose={() => setShowToast(false)} 
      />
      <PaywallModal 
        isOpen={showPaywall}
        type="register"
        title="¡Has ganado puntos!"
        description="Crea tu cuenta gratuita ahora para guardar tus rachas, agenda diaria y asegurar que tu progreso no se pierda jamás."
        onClose={() => setShowPaywall(false)}
      />
      <BottomNav />
    </div>
  );
}

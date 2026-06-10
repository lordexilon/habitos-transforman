'use client';

import React, { useState, useEffect, useCallback } from 'react';
import BottomNav from '@/components/layout/BottomNav';
import DuolingoToast from '@/components/ui/DuolingoToast';
import {
  BookOpen, CheckCircle2, Circle, Flame, Sparkles, Trophy,
  Plus, X, Clock, Bell, ChevronLeft, ChevronRight, Repeat
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import PaywallModal from '@/components/ui/PaywallModal';
import { getChallengeForCurrentWeek } from '@/lib/weeklyChallenges';
import WeeklyEvaluationModal from '@/components/ui/WeeklyEvaluationModal';
import { createClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'habito' | 'meta' | 'aprendizaje' | 'trabajo' | 'bienestar';

type AgendaTask = {
  id: string;
  task_text: string;
  event_date: string;     // ISO date string YYYY-MM-DD
  start_time: string | null;
  end_time: string | null;
  is_all_day: boolean;
  category: Category;
  color: string;
  xp_reward: number;
  is_completed: boolean;
  recurrence: 'none' | 'daily' | 'weekly';
};

type NewTaskForm = {
  task_text: string;
  event_date: string;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  category: Category;
  xp_reward: number;
  recurrence: 'none' | 'daily' | 'weekly';
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<Category, { label: string; emoji: string; color: string; bg: string; text: string }> = {
  habito:      { label: 'Hábito',      emoji: '🏃', color: 'indigo', bg: 'bg-indigo-50',  text: 'text-indigo-600' },
  meta:        { label: 'Meta',        emoji: '🎯', color: 'violet', bg: 'bg-violet-50',  text: 'text-violet-600' },
  aprendizaje: { label: 'Aprendizaje', emoji: '📖', color: 'emerald',bg: 'bg-emerald-50', text: 'text-emerald-600' },
  trabajo:     { label: 'Trabajo',     emoji: '💼', color: 'orange', bg: 'bg-orange-50',  text: 'text-orange-600' },
  bienestar:   { label: 'Bienestar',   emoji: '🧘', color: 'rose',   bg: 'bg-rose-50',    text: 'text-rose-600' },
};

const BORDER_COLOR: Record<string, string> = {
  indigo:  'border-indigo-400',
  violet:  'border-violet-400',
  emerald: 'border-emerald-400',
  orange:  'border-orange-400',
  rose:    'border-rose-400',
};

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function toLocalISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeekDays(referenceDate: Date): Date[] {
  const days: Date[] = [];
  const today = new Date(referenceDate);
  // Start from Monday of the current week
  const dayOfWeek = today.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AgendaPage() {
  const router = useRouter();
  const { session } = useAuth();
  const supabase = createClient();

  // Dates
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>(getWeekDays(new Date()));

  // Tasks
  const [tasks, setTasks] = useState<AgendaTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Quick Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<NewTaskForm>({
    task_text: '',
    event_date: toLocalISODate(new Date()),
    start_time: '09:00',
    end_time: '',
    is_all_day: false,
    category: 'habito',
    xp_reward: 10,
    recurrence: 'none',
  });
  const [saving, setSaving] = useState(false);

  // UI States
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'passive-aggressive'>('success');
  const [showToast, setShowToast] = useState(false);
  const [pillRead, setPillRead] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Weekly Challenge
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [weeklyEvaluated, setWeeklyEvaluated] = useState(false);
  const [isEvaluationTime, setIsEvaluationTime] = useState(false);
  const [weekId, setWeekId] = useState('');

  const currentChallenge = getChallengeForCurrentWeek();

  // ─── Week Strip Navigation ─────────────────────────────────────────────────
  const navigateWeek = (direction: -1 | 1) => {
    const newRef = new Date(weekDays[0]);
    newRef.setDate(newRef.getDate() + direction * 7);
    setWeekDays(getWeekDays(newRef));
  };

  // ─── Load Tasks ───────────────────────────────────────────────────────────
  const loadTasks = useCallback(async () => {
    setLoadingTasks(true);
    const dateStr = toLocalISODate(selectedDate);

    if (session?.user?.id) {
      // Supabase: fetch for selected date + recurring tasks
      const { data, error } = await supabase
        .from('user_agenda')
        .select('*')
        .eq('user_id', session.user.id)
        .or(`event_date.eq.${dateStr},recurrence.eq.daily,recurrence.eq.weekly`)
        .order('start_time', { ascending: true, nullsFirst: false });

      if (!error && data) {
        // Filter weekly recurrence to same weekday
        const dayOfWeek = selectedDate.getDay();
        const filtered = data.filter((t: any) => {
          if (t.recurrence === 'daily') return true;
          if (t.recurrence === 'weekly') {
            const taskDate = new Date(t.event_date);
            return taskDate.getDay() === dayOfWeek;
          }
          return t.event_date === dateStr;
        });
        setTasks(filtered.map((t: any) => ({
          id: t.id,
          task_text: t.task_text,
          event_date: t.event_date,
          start_time: t.start_time,
          end_time: t.end_time,
          is_all_day: t.is_all_day,
          category: t.category || 'habito',
          color: t.color || 'indigo',
          xp_reward: t.xp_reward || 10,
          is_completed: t.is_completed,
          recurrence: t.recurrence || 'none',
        })));
      }
    } else {
      // Guest: localStorage
      const saved = localStorage.getItem(`guest_agenda_${dateStr}`);
      if (saved) {
        setTasks(JSON.parse(saved));
      } else {
        // Default tasks for today only
        const isToday = dateStr === toLocalISODate(new Date());
        setTasks(isToday ? [
          { id: '1', task_text: 'Tomar 2 vasos de agua', event_date: dateStr, start_time: '08:00', end_time: null, is_all_day: false, category: 'bienestar', color: 'rose', xp_reward: 10, is_completed: false, recurrence: 'none' },
          { id: '2', task_text: 'Leer 10 páginas del ebook', event_date: dateStr, start_time: '20:00', end_time: null, is_all_day: false, category: 'aprendizaje', color: 'emerald', xp_reward: 15, is_completed: false, recurrence: 'none' },
        ] : []);
      }
    }
    setLoadingTasks(false);
  }, [selectedDate, session, supabase]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    const userId = session?.user?.id || 'guest';
    const read = localStorage.getItem(`pill_read_today_${userId}`);
    if (read) setPillRead(true);

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
    const currentWeekId = `${now.getFullYear()}-W${weekNumber}`;
    setWeekId(currentWeekId);

    const evaluated = localStorage.getItem(`weekly_evaluated_${currentWeekId}_${userId}`) === 'true';
    setWeeklyEvaluated(evaluated);

    const day = now.getDay();
    const hours = now.getHours();
    setIsEvaluationTime((day === 5 && hours >= 20) || day === 6 || day === 0);
  }, [session]);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const triggerToast = (type: 'success' | 'passive-aggressive', message: string) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
  };

  const addXP = (points: number) => {
    const userId = session?.user?.id || 'guest';
    const current = Number(localStorage.getItem(`user_points_${userId}`) || '0');
    localStorage.setItem(`user_points_${userId}`, (current + points).toString());
    window.dispatchEvent(new Event('pointsUpdated'));
  };

  const getTasksForDate = (date: Date): AgendaTask[] => {
    const dateStr = toLocalISODate(date);
    const dayOfWeek = date.getDay();
    return tasks.filter(t => {
      if (t.recurrence === 'daily') return true;
      if (t.recurrence === 'weekly') return new Date(t.event_date).getDay() === dayOfWeek;
      return t.event_date === dateStr;
    });
  };

  const selectedDateStr = toLocalISODate(selectedDate);
  const todayStr = toLocalISODate(new Date());
  const todayTasks = tasks.filter(t => {
    if (t.recurrence === 'daily') return true;
    if (t.recurrence === 'weekly') return new Date(t.event_date).getDay() === selectedDate.getDay();
    return t.event_date === selectedDateStr;
  });

  const completedCount = todayTasks.filter(t => t.is_completed).length;

  // ─── Toggle Task ──────────────────────────────────────────────────────────

  const toggleTask = async (taskId: string) => {
    if (!session) { setShowPaywall(true); return; }

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.is_completed;

    if (newCompleted) {
      addXP(task.xp_reward);
      triggerToast('success', `¡Excelente! +${task.xp_reward} XP ganados. 🔥`);
    } else {
      triggerToast('passive-aggressive', '¿En serio lo desmarcaste? 🦉');
    }

    const updated = tasks.map(t => t.id === taskId ? { ...t, is_completed: newCompleted } : t);
    setTasks(updated);

    if (session?.user?.id) {
      await supabase.from('user_agenda').update({
        is_completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null
      }).eq('id', taskId);
    } else {
      localStorage.setItem(`guest_agenda_${selectedDateStr}`, JSON.stringify(updated));
    }
  };

  // ─── Delete Task ──────────────────────────────────────────────────────────

  const deleteTask = async (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    if (session?.user?.id) {
      await supabase.from('user_agenda').delete().eq('id', taskId);
    } else {
      localStorage.setItem(`guest_agenda_${selectedDateStr}`, JSON.stringify(updated));
    }
  };

  // ─── Save New Task ────────────────────────────────────────────────────────

  const saveTask = async () => {
    if (!form.task_text.trim()) return;
    setSaving(true);

    const catConfig = CATEGORY_CONFIG[form.category];
    const newTask: AgendaTask = {
      id: Date.now().toString(),
      task_text: form.task_text.trim(),
      event_date: form.event_date,
      start_time: form.is_all_day ? null : form.start_time || null,
      end_time: form.is_all_day ? null : form.end_time || null,
      is_all_day: form.is_all_day,
      category: form.category,
      color: catConfig.color,
      xp_reward: form.xp_reward,
      is_completed: false,
      recurrence: form.recurrence,
    };

    if (session?.user?.id) {
      const { data, error } = await supabase.from('user_agenda').insert({
        user_id: session.user.id,
        task_text: newTask.task_text,
        event_date: newTask.event_date,
        start_time: newTask.start_time,
        end_time: newTask.end_time,
        is_all_day: newTask.is_all_day,
        category: newTask.category,
        color: newTask.color,
        xp_reward: newTask.xp_reward,
        recurrence: newTask.recurrence,
        is_completed: false,
      }).select().single();

      if (!error && data) newTask.id = data.id;
    }

    // If date matches selected, add to local state
    if (newTask.event_date === selectedDateStr || newTask.recurrence !== 'none') {
      setTasks(prev => [...prev, newTask]);
      if (!session?.user?.id) {
        const saved = JSON.parse(localStorage.getItem(`guest_agenda_${selectedDateStr}`) || '[]');
        localStorage.setItem(`guest_agenda_${selectedDateStr}`, JSON.stringify([...saved, newTask]));
      }
    }

    setSaving(false);
    setShowAddModal(false);
    setForm({
      task_text: '', event_date: toLocalISODate(selectedDate),
      start_time: '09:00', end_time: '', is_all_day: false,
      category: 'habito', xp_reward: 10, recurrence: 'none',
    });
    triggerToast('success', '¡Tarea agregada! Ya está en tu agenda. ✅');
  };

  const completePill = () => {
    if (!session) { setShowPaywall(true); return; }
    const userId = session?.user?.id || 'guest';
    setPillRead(true);
    localStorage.setItem(`pill_read_today_${userId}`, 'true');
    addXP(25);
    triggerToast('success', '¡Sabiduría absorbida! +25 XP. 🧠');
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const isToday = selectedDateStr === todayStr;
  const isTomorrow = (() => {
    const tm = new Date(); tm.setDate(tm.getDate() + 1);
    return selectedDateStr === toLocalISODate(tm);
  })();

  const headerLabel = isToday ? 'Hoy' : isTomorrow ? 'Mañana' : selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)' }}>

      {/* ── Header ── */}
      <div className="px-5 pt-12 pb-5" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Tu Agenda</p>
            <h1 className="text-3xl font-black text-white capitalize">{headerLabel}</h1>
            {completedCount > 0 && (
              <p className="text-indigo-200 text-sm font-medium mt-1">
                {completedCount}/{todayTasks.length} completadas · +{todayTasks.filter(t=>t.is_completed).reduce((s,t)=>s+t.xp_reward,0)} XP
              </p>
            )}
          </div>
          <button
            onClick={() => { setForm(f => ({ ...f, event_date: selectedDateStr })); setShowAddModal(true); }}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2.5 rounded-2xl text-sm transition-all active:scale-95 backdrop-blur-sm border border-white/20"
          >
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>

        {/* ── Week Strip ── */}
        <div className="flex items-center gap-1">
          <button onClick={() => navigateWeek(-1)} className="text-indigo-200 hover:text-white p-1 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 grid grid-cols-7 gap-1">
            {weekDays.map((day, i) => {
              const dayStr = toLocalISODate(day);
              const isSelected = dayStr === selectedDateStr;
              const isCurrentDay = dayStr === todayStr;
              const dayTasks = getTasksForDate(day);
              const hasCompleted = dayTasks.some(t => t.is_completed);
              const hasPending = dayTasks.some(t => !t.is_completed);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center py-2 px-1 rounded-2xl transition-all ${
                    isSelected
                      ? 'bg-white text-indigo-600 shadow-lg scale-105'
                      : isCurrentDay
                      ? 'bg-white/20 text-white'
                      : 'text-indigo-200 hover:bg-white/10'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase">{DAYS_ES[day.getDay()]}</span>
                  <span className={`text-base font-black mt-0.5 ${isSelected ? 'text-indigo-600' : ''}`}>
                    {day.getDate()}
                  </span>
                  {/* Activity dots */}
                  <div className="flex gap-0.5 mt-1 h-1.5">
                    {hasCompleted && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    {hasPending && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-indigo-300' : 'bg-white/40'}`} />}
                  </div>
                </button>
              );
            })}
          </div>
          <button onClick={() => navigateWeek(1)} className="text-indigo-200 hover:text-white p-1 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-5 space-y-6 mt-5">

        {/* ── Píldora Diaria ── */}
        {isToday && (
          <section>
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" /> Píldora de Hoy
            </h2>
            <div
              className="rounded-2xl p-5 text-white relative overflow-hidden shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' }}
            >
              <Sparkles className="absolute -top-4 -right-4 w-20 h-20 text-white opacity-10" />
              <p className="font-medium text-base leading-snug mb-4 relative z-10">
                &ldquo;El éxito es el producto de los hábitos diarios, no de las transformaciones de una vez en la vida.&rdquo;
              </p>
              {!pillRead ? (
                <button
                  onClick={completePill}
                  className="bg-white text-indigo-600 font-bold px-4 py-2 rounded-full text-sm hover:bg-indigo-50 transition-colors w-full active:scale-95"
                >
                  Lo he leído · +25 XP
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 bg-white/20 font-bold px-4 py-2 rounded-full text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Leído y asimilado
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Reto Semanal ── */}
        {isToday && (
          <section>
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> Reto de la Semana
            </h2>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">

              {/* Header del reto */}
              <div className="flex justify-between items-start gap-3 mb-4">
                <div className="flex-1">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    weeklyEvaluated
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-indigo-600 bg-indigo-50'
                  }`}>
                    {weeklyEvaluated ? '✓ Completado' : 'Desafío Activo'}
                  </span>
                  <h3 className="font-black text-gray-900 text-base mt-2 leading-tight">{currentChallenge.title}</h3>
                  <p className="text-gray-500 text-sm font-medium mt-1 leading-snug">{currentChallenge.description}</p>
                </div>
                <div className="bg-amber-50 text-amber-600 w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold shrink-0 border border-amber-100">
                  <span className="text-lg font-black leading-none">+{currentChallenge.points}</span>
                  <span className="text-[8px] font-black tracking-wider uppercase leading-none mt-0.5">XP</span>
                </div>
              </div>

              {!weeklyEvaluated && (() => {
                // Progreso: días completados esta semana (tareas completadas / 7)
                const now = new Date();
                const dayOfWeek = now.getDay(); // 0=Dom
                // Días desde el lunes (0=Lun ... 6=Dom)
                const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                const daysInWeek = 7;
                // Días que faltan hasta el próximo viernes 8pm (evaluación)
                const daysToFriday = dayOfWeek <= 5
                  ? 5 - dayOfWeek
                  : 6; // domingo -> próximo viernes

                const weekProgress = Math.round((daysSinceMonday / 6) * 100);

                return (
                  <>
                    {/* Barra de progreso de la semana */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-gray-500">Progreso de la semana</span>
                        <span className="text-xs font-black text-indigo-600">{weekProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${weekProgress}%`,
                            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
                          <span
                            key={i}
                            className={`text-[9px] font-black w-5 text-center ${
                              i < daysSinceMonday
                                ? 'text-indigo-500'
                                : i === daysSinceMonday
                                ? 'text-indigo-700'
                                : 'text-gray-300'
                            }`}
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Separador */}
                    <div className="border-t border-dashed border-gray-100 pt-3">
                      {isEvaluationTime ? (
                        /* Es momento de evaluar */
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                            <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
                            ¡Es momento de tu Evaluación Semanal!
                          </div>
                          <button
                            onClick={() => setShowWeeklyModal(true)}
                            className="w-full text-white font-bold py-3 rounded-xl text-sm shadow-md active:scale-95 transition-all"
                            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
                          >
                            🏆 Iniciar Evaluación del Coach
                          </button>
                        </div>
                      ) : (
                        /* Todavía en curso: mostrar countdown y botón de check-in */
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
                              <span className="text-base">📅</span>
                            </div>
                            <div>
                              <p className="text-xs font-black text-gray-700">
                                {daysToFriday === 0
                                  ? 'Evaluación hoy a las 8 PM'
                                  : `Evaluación en ${daysToFriday} día${daysToFriday !== 1 ? 's' : ''}`}
                              </p>
                              <p className="text-[10px] text-gray-400 font-medium">Sigue cumpliendo el reto cada día</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (!session) { setShowPaywall(true); return; }
                              triggerToast('success', `¡Check-in del reto "${currentChallenge.title}" registrado! +5 XP 🔥`);
                              addXP(5);
                            }}
                            className="shrink-0 bg-indigo-50 text-indigo-600 font-black text-xs px-3 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 active:scale-95 transition-all"
                          >
                            ✓ Check-in
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}

              {weeklyEvaluated && (
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 rounded-xl px-3 py-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ¡Reto completado y evaluado esta semana! 🏆
                </div>
              )}
            </div>
          </section>
        )}


        {/* ── Task Timeline ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              {isToday ? 'Tareas de Hoy' : `Tareas del ${selectedDate.getDate()}`}
            </h2>
            <span className="text-xs font-bold text-gray-400">
              {completedCount}/{todayTasks.length} hechas
            </span>
          </div>

          {loadingTasks ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse flex gap-3">
                  <div className="w-7 h-7 bg-gray-100 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : todayTasks.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <div className="text-4xl mb-3">📅</div>
              <p className="font-bold text-gray-700 mb-1">Sin tareas para este día</p>
              <p className="text-gray-400 text-sm mb-4">¡Agrega una actividad para empezar tu racha!</p>
              <button
                onClick={() => { setForm(f => ({ ...f, event_date: selectedDateStr })); setShowAddModal(true); }}
                className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-700 active:scale-95 transition-all"
              >
                + Agregar tarea
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {todayTasks
                .sort((a, b) => {
                  if (!a.start_time) return 1;
                  if (!b.start_time) return -1;
                  return a.start_time.localeCompare(b.start_time);
                })
                .map(task => {
                  const cat = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.habito;
                  const borderColor = BORDER_COLOR[task.color] || 'border-indigo-400';
                  return (
                    <div
                      key={task.id}
                      className={`bg-white rounded-2xl border-l-4 shadow-sm transition-all ${borderColor} ${task.is_completed ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center gap-3 p-4">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="shrink-0 transition-transform active:scale-90"
                        >
                          {task.is_completed
                            ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            : <Circle className="w-6 h-6 text-gray-300" />
                          }
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold text-gray-900 leading-tight ${task.is_completed ? 'line-through text-gray-400' : ''}`}>
                            {task.task_text}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {task.start_time && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg">
                                <Clock className="w-3 h-3" />
                                {task.start_time.slice(0, 5)}{task.end_time ? ` - ${task.end_time.slice(0, 5)}` : ''}
                              </span>
                            )}
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${cat.bg} ${cat.text}`}>
                              {cat.emoji} {cat.label}
                            </span>
                            {task.recurrence !== 'none' && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg">
                                <Repeat className="w-3 h-3" />
                                {task.recurrence === 'daily' ? 'Diario' : 'Semanal'}
                              </span>
                            )}
                            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">
                              +{task.xp_reward} XP
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="shrink-0 text-gray-300 hover:text-rose-400 transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </section>

        {/* ── Notification Banner (if not in perfil) ── */}
        {isToday && !session && (
          <div className="bg-indigo-600 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
            <Bell className="w-8 h-8 text-indigo-200 shrink-0" />
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Activa recordatorios</p>
              <p className="text-indigo-200 text-xs">Tu Coach te avisará cuando sea hora de tus hábitos</p>
            </div>
            <button
              onClick={() => setShowPaywall(true)}
              className="bg-white text-indigo-600 font-bold text-xs px-3 py-2 rounded-xl shrink-0 active:scale-95 transition-all"
            >
              Activar
            </button>
          </div>
        )}

      </div>

      {/* ──── Quick Add Modal ──── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div
            className="w-full bg-white rounded-t-3xl p-6 pb-10 shadow-2xl"
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-black text-gray-900">Nueva Tarea</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Task name */}
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 block">
                  ¿Qué vas a hacer?
                </label>
                <input
                  type="text"
                  value={form.task_text}
                  onChange={e => setForm(f => ({ ...f, task_text: e.target.value }))}
                  placeholder="Ej. Meditar 10 minutos"
                  className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-2xl px-4 py-3 text-gray-900 font-medium text-base outline-none transition-colors"
                  autoFocus
                />
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Fecha
                </label>
                <input
                  type="date"
                  value={form.event_date}
                  onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
                  className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-2xl px-4 py-3 text-gray-900 font-medium outline-none transition-colors"
                />
              </div>

              {/* All day toggle */}
              <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                <span className="text-sm font-bold text-gray-700">Todo el día</span>
                <button
                  onClick={() => setForm(f => ({ ...f, is_all_day: !f.is_all_day }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${form.is_all_day ? 'bg-indigo-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_all_day ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Time */}
              {!form.is_all_day && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 block">
                      Hora inicio
                    </label>
                    <input
                      type="time"
                      value={form.start_time}
                      onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                      className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-2xl px-4 py-3 text-gray-900 font-medium outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 block">
                      Hora fin
                    </label>
                    <input
                      type="time"
                      value={form.end_time}
                      onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                      className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-2xl px-4 py-3 text-gray-900 font-medium outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Categoría
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(Object.entries(CATEGORY_CONFIG) as [Category, typeof CATEGORY_CONFIG[Category]][]).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setForm(f => ({ ...f, category: key }))}
                      className={`flex flex-col items-center py-2.5 px-1 rounded-2xl border-2 transition-all ${
                        form.category === key
                          ? 'border-indigo-400 bg-indigo-50'
                          : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <span className="text-lg">{cfg.emoji}</span>
                      <span className="text-[9px] font-black text-gray-600 mt-1">{cfg.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* XP & Recurrence */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 block">
                    Puntos XP
                  </label>
                  <select
                    value={form.xp_reward}
                    onChange={e => setForm(f => ({ ...f, xp_reward: Number(e.target.value) }))}
                    className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-2xl px-4 py-3 text-gray-900 font-medium outline-none transition-colors bg-white"
                  >
                    {[5, 10, 15, 20, 25, 50].map(v => (
                      <option key={v} value={v}>+{v} XP</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 block">
                    Repetición
                  </label>
                  <select
                    value={form.recurrence}
                    onChange={e => setForm(f => ({ ...f, recurrence: e.target.value as any }))}
                    className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-2xl px-4 py-3 text-gray-900 font-medium outline-none transition-colors bg-white"
                  >
                    <option value="none">Sin repetir</option>
                    <option value="daily">Cada día</option>
                    <option value="weekly">Cada semana</option>
                  </select>
                </div>
              </div>

              {/* Save */}
              <button
                onClick={saveTask}
                disabled={!form.task_text.trim() || saving}
                className="w-full font-black text-white py-4 rounded-2xl text-base transition-all active:scale-95 disabled:opacity-50 mt-2 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
              >
                {saving ? 'Guardando...' : `Agregar +${form.xp_reward} XP`}
              </button>
            </div>
          </div>
        </div>
      )}

      <DuolingoToast
        isOpen={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
      <PaywallModal
        isOpen={showPaywall}
        type="register"
        title="¡Crea tu cuenta gratis!"
        description="Guarda tus tareas, rachas y puntos para siempre. ¡Tu progreso te espera!"
        onClose={() => setShowPaywall(false)}
      />
      <WeeklyEvaluationModal
        isOpen={showWeeklyModal}
        onClose={() => setShowWeeklyModal(false)}
        completedTasksCount={completedCount}
        totalTasksCount={todayTasks.length}
        challengeTitle={currentChallenge.title}
        challengePoints={currentChallenge.points}
        onSuccess={() => {
          const userId = session?.user?.id || 'guest';
          localStorage.setItem(`weekly_evaluated_${weekId}_${userId}`, 'true');
          setWeeklyEvaluated(true);
          setShowWeeklyModal(false);
          triggerToast('success', '¡Retrospectiva completada! +100 XP. 🏆');
        }}
      />
      <BottomNav />
    </div>
  );
}

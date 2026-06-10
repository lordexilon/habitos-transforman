'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, ArrowLeft, Loader2, Sparkles, Trash2, Volume2, VolumeX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import PaywallModal from '@/components/ui/PaywallModal';
import VoiceButton from '@/components/ui/VoiceButton';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  isVoice?: boolean;
};

const INITIAL_MESSAGE: Message[] = [
  {
    role: 'assistant',
    content: '¡Hola! Soy tu Coach de SCAHábitos. ¿Cómo va tu progreso hoy? Podés escribirme o usar el 🎤 para hablar directamente.',
  },
];

// TTS: usar Web Speech Synthesis (nativo, gratis)
function speak(text: string, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'es-ES';
  utter.rate = 1.05;
  utter.pitch = 1;

  // Preferir voz en español si existe
  const voices = window.speechSynthesis.getVoices();
  const esVoice = voices.find(v => v.lang.startsWith('es') && !v.name.includes('Google'));
  const googleEs = voices.find(v => v.lang.startsWith('es'));
  if (esVoice || googleEs) utter.voice = esVoice || googleEs!;

  utter.onend = () => onEnd?.();
  utter.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utter);
}

export default function CoachChat() {
  const router = useRouter();
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGE);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isGeneratingAgenda, setIsGeneratingAgenda] = useState(false);
  const [userHabits, setUserHabits] = useState<any[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallType, setPaywallType] = useState<'register' | 'paywall'>('register');
  const [interactionCount, setInteractionCount] = useState('0');
  const { session } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Cargar hábitos e historial
  useEffect(() => {
    async function loadHabits() {
      if (!session?.user?.id) { setUserHabits([]); return; }
      const { data } = await supabase
        .from('user_habits')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      setUserHabits(data?.map(d => d.habit_data) || []);
    }
    loadHabits();

    const userId = session?.user?.id || 'guest';
    const saved = localStorage.getItem(`chat_history_${userId}`);
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch {}
    } else {
      setMessages(INITIAL_MESSAGE);
    }

    const count = localStorage.getItem('coach_interactions') || '0';
    setInteractionCount(count);
  }, [session]);

  // Guardar historial
  useEffect(() => {
    const userId = session?.user?.id || 'guest';
    if (messages.length > 1) {
      localStorage.setItem(`chat_history_${userId}`, JSON.stringify(messages));
    }
  }, [messages, session]);

  // Precarga voces de síntesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener('voiceschanged', () =>
        window.speechSynthesis.getVoices()
      );
    }
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const checkLimit = (): boolean => {
    const interactions = Number(interactionCount);
    if (!session && interactions >= 5) {
      setPaywallType('register'); setShowPaywall(true); return false;
    }
    if (session && interactions >= 20) {
      setPaywallType('paywall'); setShowPaywall(true); return false;
    }
    return true;
  };

  const incrementCount = () => {
    const next = (Number(interactionCount) + 1).toString();
    localStorage.setItem('coach_interactions', next);
    setInteractionCount(next);
  };

  // ── Envío de texto (streaming) ──────────────────────────────────────────
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;
    if (!checkLimit()) return;

    const userMsg = input.trim();
    setInput('');
    incrementCount();

    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, userHabits: userHabits.length > 0 ? userHabits : null }),
      });

      if (!res.ok || !res.body) throw new Error('Error de conexión');

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value, { stream: true }).split('\n').filter(l => l.trim());
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const dataStr = line.slice(6).trim();
          if (dataStr === '[DONE]') continue;
          try {
            const data = JSON.parse(dataStr);
            const delta = data.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              setMessages(prev => {
                const msgs = [...prev];
                msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content: fullContent };
                return msgs;
              });
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Lo siento, tuve un problema de conexión. ¿Intentamos de nuevo?' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // ── Envío de voz (respuesta corta + TTS) ────────────────────────────────
  const handleVoiceTranscript = useCallback(async (transcript: string) => {
    if (!transcript.trim() || isTyping) return;
    if (!checkLimit()) return;

    incrementCount();
    const newMessages: Message[] = [...messages, { role: 'user', content: transcript, isVoice: true }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const res = await fetch('/api/coach/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transcript,
          userHabits: userHabits.length > 0 ? userHabits : null,
          history: messages.slice(-4),
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'No pude procesar tu mensaje.';

      const assistantMsg: Message = { role: 'assistant', content: reply, isVoice: true };
      setMessages(prev => [...prev, assistantMsg]);

      // Leer la respuesta en voz si TTS está habilitado
      if (ttsEnabled) {
        setIsSpeaking(true);
        speak(reply, () => setIsSpeaking(false));
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Tuve un problema. ¿Podemos intentarlo de nuevo?' },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, isTyping, userHabits, ttsEnabled, interactionCount, session]);

  const handleClearHistory = () => {
    if (!confirm('¿Borrar el historial de conversación?')) return;
    const userId = session?.user?.id || 'guest';
    setMessages(INITIAL_MESSAGE);
    localStorage.removeItem(`chat_history_${userId}`);
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const handleGenerateAgenda = async (text: string) => {
    setIsGeneratingAgenda(true);
    try {
      const res = await fetch('/api/agenda/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachText: text }),
      });
      if (res.ok) {
        const data = await res.json();
        
        // Obtener la fecha de hoy en formato local (YYYY-MM-DD)
        const tzoffset = (new Date()).getTimezoneOffset() * 60000;
        const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];
        
        const agendaWithIds = data.agenda.map((t: any) => {
          let sTime = '09:00';
          if (t.start_time) sTime = t.start_time;
          else if (t.time) {
            const timeStr = t.time.toLowerCase();
            if (timeStr.includes('mañana')) sTime = '08:00';
            else if (timeStr.includes('tarde')) sTime = '14:00';
            else if (timeStr.includes('noche')) sTime = '20:00';
          }

          return {
            ...t,
            id: Math.random().toString(36).substring(7),
            task_text: t.task_text || t.task || 'Hábito sugerido',
            event_date: localISOTime,
            start_time: sTime,
            is_completed: false,
            recurrence: 'none'
          };
        });

        if (session?.user?.id) {
          // Usuario autenticado: Insertar en Supabase
          const insertData = agendaWithIds.map((t: any) => ({
            user_id: session.user.id,
            task_text: t.task_text,
            event_date: t.event_date,
            start_time: t.start_time,
            end_time: null,
            is_all_day: t.is_all_day || false,
            category: t.category || 'habito',
            color: t.color || 'indigo',
            xp_reward: t.xp_reward || 10,
            recurrence: t.recurrence,
            is_completed: false
          }));
          const { error } = await supabase.from('user_agenda').insert(insertData);
          if (error) console.error('Error insertando en Supabase:', error);
        } else {
          // Guest: Insertar en el nuevo formato guest_agenda_YYYY-MM-DD
          const key = `guest_agenda_${localISOTime}`;
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          localStorage.setItem(key, JSON.stringify([...existing, ...agendaWithIds]));
        }

        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `¡Listo! Agregué **${data.agenda.length} tareas** a tu agenda de hoy. 🎯` },
        ]);
        router.push('/agenda');
      }
    } catch (e) { 
      console.error('agenda error', e); 
    }
    finally { setIsGeneratingAgenda(false); }
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const limit = session ? 20 : 5;
  const remaining = Math.max(0, limit - Number(interactionCount));

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    // Usamos dvh (dynamic viewport height) para evitar desfase en móviles con barra de browser
    <div
      className="flex flex-col bg-gray-50"
      style={{ height: 'calc(100dvh - 128px)', minHeight: '400px' }}
    >
      {/* ── Top Bar ── */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between z-10 shadow-sm shrink-0">
        <button
          onClick={() => router.push('/')}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center">
          <h1 className="font-black text-gray-800 flex items-center gap-1.5 text-base">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Coach Virtual
          </h1>
          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
            En línea
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Toggle TTS */}
          <button
            onClick={() => { if (isSpeaking) stopSpeaking(); setTtsEnabled(v => !v); }}
            title={ttsEnabled ? 'Silenciar Coach' : 'Activar voz del Coach'}
            className={`p-2 rounded-full transition-colors ${ttsEnabled ? 'text-indigo-500 bg-indigo-50' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            {isSpeaking
              ? <Volume2 className="w-4 h-4 animate-pulse" />
              : ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />
            }
          </button>
          <button
            onClick={handleClearHistory}
            className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Borrar historial"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Messages — flex-1 + overflow-y-auto garantiza scroll interno ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
        {messages.map((msg, i) => (
          <React.Fragment key={i}>
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 shrink-0 self-end mb-1">
                  <Bot className="w-4 h-4 text-indigo-600" />
                </div>
              )}

              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                }`}
              >
                {/* Indicador de mensaje de voz */}
                {msg.isVoice && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider opacity-60 mb-1 block">
                    🎤 {msg.role === 'user' ? 'Voz' : 'Coach en voz'}
                  </span>
                )}
                <span
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                  }}
                />
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 shrink-0 self-end mb-1 text-xs font-black text-gray-500">
                  {session?.user?.email?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>

            {/* Botón agregar a agenda — solo en último mensaje del coach */}
            {msg.role === 'assistant' && i === messages.length - 1 && !isTyping && (
              <div className="pl-10 flex justify-start">
                <button
                  onClick={() => handleGenerateAgenda(msg.content)}
                  disabled={isGeneratingAgenda}
                  className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-emerald-600 shadow-md transition-all active:scale-95 disabled:opacity-70"
                >
                  {isGeneratingAgenda
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Sparkles className="w-3.5 h-3.5" />
                  }
                  {isGeneratingAgenda ? 'Generando...' : 'Agregar a mi Agenda'}
                </button>
              </div>
            )}
          </React.Fragment>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 shrink-0 self-end mb-1">
              <Bot className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="flex justify-start pl-10">
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-2 text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              Hablando... (tap para silenciar)
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area — shrink-0 evita que se comprima ── */}
      <div className="bg-white border-t shrink-0 px-4 pt-3 pb-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          {/* Botón de voz a la izquierda */}
          <VoiceButton
            onTranscript={handleVoiceTranscript}
            disabled={isTyping}
          />

          {/* Input de texto */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Escribe o usa el micrófono..."
            className="flex-1 bg-gray-100 text-gray-800 rounded-full px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            disabled={isTyping}
          />

          {/* Botón enviar */}
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0 shadow-md"
          >
            {isTyping
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </form>

        {/* Contador de interacciones */}
        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-[10px] text-gray-400 font-semibold">
            🎤 Mantené presionado el mic para hablar
          </p>
          <p className={`text-[10px] font-bold ${remaining <= 2 ? 'text-orange-500' : 'text-gray-400'}`}>
            {remaining} mensajes restantes
          </p>
        </div>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        type={paywallType}
        title={paywallType === 'register' ? 'Límite Gratuito' : 'Desbloquea Coach Ilimitado'}
        description={
          paywallType === 'register'
            ? 'Creá tu cuenta gratis para desbloquear más interacciones con el Coach.'
            : 'Alcanzaste tu límite diario. Desbloqueá rutinas ilimitadas por el precio de un café al mes.'
        }
        onClose={() => setShowPaywall(false)}
      />
    </div>
  );
}

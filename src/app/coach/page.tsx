'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, ArrowLeft, Loader2, Sparkles, Trash2, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import PaywallModal from '@/components/ui/PaywallModal';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function CoachChat() {
  const router = useRouter();
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy tu Coach de SCAHábitos. ¿Cómo va tu progreso hoy? Si tuviste algún problema con tus rutinas o tienes dudas sobre la ciencia de los hábitos, cuéntamelo y lo resolvemos.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingAgenda, setIsGeneratingAgenda] = useState(false);
  const [userHabits, setUserHabits] = useState<any[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallType, setPaywallType] = useState<'register' | 'paywall'>('register');
  const [interactionCount, setInteractionCount] = useState('0');
  const { session } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Cargar contexto del usuario (sus hábitos guardados en BD)
  useEffect(() => {
    async function loadHabits() {
      const { data } = await supabase.from('user_habits').select('*').order('created_at', { ascending: false }).limit(5);
      if (data && data.length > 0) {
        setUserHabits(data.map(d => d.habit_data));
      }
    }
    loadHabits();
    
    // Cargar historial de chat
    const userId = session?.user?.id || 'guest';
    const saved = localStorage.getItem(`chat_history_${userId}`);
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch (e) {}
    }
  }, [session]);

  // Guardar historial
  useEffect(() => {
    const userId = session?.user?.id || 'guest';
    if (messages.length > 1) {
      localStorage.setItem(`chat_history_${userId}`, JSON.stringify(messages));
    }
  }, [messages, session]);

  const handleClearHistory = () => {
    if (confirm('¿Estás seguro de que quieres borrar el historial de la conversación?')) {
      const userId = session?.user?.id || 'guest';
      setMessages(INITIAL_MESSAGE);
      localStorage.removeItem(`chat_history_${userId}`);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    // Verificar límite de uso
    let interactions = Number(interactionCount);

    if (!session && interactions >= 5) {
      setPaywallType('register');
      setShowPaywall(true);
      return;
    }

    if (session && interactions >= 10) {
      setPaywallType('paywall');
      setShowPaywall(true);
      return;
    }

    localStorage.setItem('coach_interactions', (interactions + 1).toString());
    setInteractionCount((interactions + 1).toString());

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg } as Message];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          userHabits: userHabits.length > 0 ? userHabits : null
        })
      });

      if (!res.ok) throw new Error('Error al conectar con el Coach');
      if (!res.body) throw new Error('No stream body');

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let currentMessageContent = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(l => l.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (dataStr === '[DONE]') continue;
              
              try {
                const data = JSON.parse(dataStr);
                if (data.choices && data.choices[0]?.delta?.content) {
                  currentMessageContent += data.choices[0].delta.content;
                  setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = { 
                      ...newMsgs[newMsgs.length - 1], 
                      content: currentMessageContent 
                    };
                    return newMsgs;
                  });
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      const userId = session?.user?.id || 'guest';
      const updatedMessages = [...newMessages, { role: 'assistant', content: 'Lo siento, he tenido un problema de conexión. ¿Podemos intentarlo de nuevo?' } as Message];
      setMessages(updatedMessages);
      localStorage.setItem(`chat_history_${userId}`, JSON.stringify(updatedMessages));
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateAgenda = async (text: string) => {
    setIsGeneratingAgenda(true);
    try {
      const res = await fetch('/api/agenda/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachText: text })
      });
      if (res.ok) {
        const data = await res.json();
        const userId = session?.user?.id || 'guest';
        const agendaWithIds = data.agenda.map((t: any) => ({ ...t, id: Math.random().toString(36).substring(7), completed: false }));
        
        localStorage.setItem(`user_agenda_${userId}`, JSON.stringify(agendaWithIds));
        
        // Update chat history
        const updatedMessages = [...messages, { role: 'assistant', content: `¡Excelente! He agregado: **${data.agenda.length} tareas** a tu agenda.` } as Message];
        setMessages(updatedMessages);
        localStorage.setItem(`chat_history_${userId}`, JSON.stringify(updatedMessages));

        // Reset pill
        localStorage.removeItem(`pill_read_today_${userId}`);
        router.push('/agenda');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingAgenda(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-128px)] bg-gray-50 relative">
      {/* Top Bar */}
      <div className="bg-white border-b px-4 py-4 flex items-center justify-between z-10 shadow-sm">
        <button onClick={() => router.push('/')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="font-black text-gray-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Coach Virtual
          </h1>
          <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">En línea</span>
        </div>
        <button 
          onClick={handleClearHistory} 
          className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          title="Borrar historial"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((msg, i) => (
          <React.Fragment key={i}>
          <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 shrink-0 self-end mb-1">
                <Bot className="w-5 h-5 text-indigo-600" />
              </div>
            )}
            
            <div 
              className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-md' 
                  : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
              }`}
              dangerouslySetInnerHTML={{ 
                __html: msg.content
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
              }}
            />
            
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 shrink-0 self-end mb-1">
                <User className="w-5 h-5 text-gray-500" />
              </div>
            )}
          </div>
          
          {msg.role === 'assistant' && i === messages.length - 1 && !isTyping && (
             <div className="pl-10 flex justify-start">
               <button 
                 onClick={() => handleGenerateAgenda(msg.content)}
                 disabled={isGeneratingAgenda}
                 className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-emerald-600 shadow-md transition-all active:scale-95 disabled:opacity-70"
               >
                 {isGeneratingAgenda ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                 {isGeneratingAgenda ? 'Mapeando tu cerebro...' : 'Agregar esto a mi Agenda'}
               </button>
             </div>
          )}
          </React.Fragment>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 shrink-0 self-end mb-1">
              <Bot className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Dime, ¿qué te frenó hoy?"
            className="flex-1 bg-gray-100 text-gray-800 rounded-full px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium pr-12"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-indigo-600 text-white rounded-full p-3.5 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md absolute right-1 top-1 bottom-1 flex items-center justify-center"
          >
            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
        <div className="text-center mt-2 text-[10px] font-semibold text-gray-400">
          Interacciones: {interactionCount} / {session ? '10' : '5'}
        </div>
      </div>

      <PaywallModal 
        isOpen={showPaywall}
        type={paywallType}
        title={paywallType === 'register' ? 'Límite Gratuito Alcanzado' : 'Desbloquea Coach Ilimitado'}
        description={paywallType === 'register' 
          ? 'Has gastado tus 5 interacciones gratuitas del día. Crea una cuenta gratis para desbloquear más capacidad de IA.'
          : 'Has alcanzado tu límite diario de IA gratuita. Desbloquea rutinas ilimitadas y personalizadas por el precio de un café al mes.'}
        onClose={() => setShowPaywall(false)}
      />
    </div>
  );
}

'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, ArrowLeft, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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
  const [userHabits, setUserHabits] = useState<any[]>([]);
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
    
    // Cargar historial de chat si existe
    const saved = localStorage.getItem('coach_chat_history');
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  // Guardar historial
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem('coach_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const handleClearHistory = () => {
    if (confirm('¿Estás seguro de que quieres borrar el historial de la conversación?')) {
      localStorage.removeItem('coach_chat_history');
      setMessages([
        { role: 'assistant', content: '¡Hola! Soy tu Coach de SCAHábitos. ¿Cómo va tu progreso hoy? Si tuviste algún problema con tus rutinas o tienes dudas sobre la ciencia de los hábitos, cuéntamelo y lo resolvemos.' }
      ]);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const apiMessages = [...messages, { role: 'user', content: userMsg }];
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          userHabits: userHabits.length > 0 ? userHabits : null
        })
      });

      if (!res.ok) throw new Error('Error al conectar con el Coach');
      if (!res.body) throw new Error('No stream body');

      // Preparar mensaje vacío para el asistente que se llenará por streaming
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
              } catch (e) {
                // Ignore partial JSON chunks
              }
            }
          }
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, tuve un problema procesando tu mensaje. Asegúrate de que Ollama esté corriendo.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto shadow-2xl overflow-hidden relative">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-36 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
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
      <div className="absolute bottom-[64px] left-0 right-0 bg-white border-t p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Dime, ¿qué te frenó hoy?"
            className="flex-1 bg-gray-100 text-gray-800 rounded-full px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-indigo-600 text-white rounded-full p-3.5 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}

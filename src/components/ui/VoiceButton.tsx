'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, X } from 'lucide-react';

type VoiceState = 'idle' | 'recording' | 'processing';

type Props = {
  onTranscript: (text: string) => void;
  disabled?: boolean;
};

// Verifica soporte del navegador
const isSpeechSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

export default function VoiceButton({ onTranscript, disabled }: Props) {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSupported(isSpeechSupported());
  }, []);

  const startRecording = useCallback(() => {
    if (!supported || disabled) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setState('recording');
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let interimText = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += t;
        else interimText += t;
      }
      setTranscript(finalText || interimText);
    };

    recognition.onend = () => {
      setState('processing');
      // Pequeño delay para mostrar el estado "procesando"
      setTimeout(() => {
        const finalTranscript = recognitionRef.current?._lastTranscript;
        if (finalTranscript?.trim()) {
          onTranscript(finalTranscript.trim());
        }
        setState('idle');
        setTranscript('');
      }, 300);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setState('idle');
      setTranscript('');
    };

    // Guardamos el transcript final antes del onend
    recognition.addEventListener('result', (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          recognitionRef.current._lastTranscript = event.results[i][0].transcript;
        }
      }
    });

    recognitionRef.current = recognition;
    recognitionRef.current._lastTranscript = '';
    recognition.start();
  }, [supported, disabled, onTranscript]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const cancelRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setState('idle');
    setTranscript('');
  }, []);

  if (!supported) return null;

  return (
    <div className="relative flex items-center">
      {/* Transcript flotante */}
      {(state === 'recording' || state === 'processing') && (
        <div className="absolute bottom-full right-0 mb-3 w-64 bg-gray-900 text-white text-xs font-medium px-4 py-3 rounded-2xl shadow-xl z-50">
          <div className="flex items-center gap-2 mb-1.5">
            {state === 'recording' ? (
              <>
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <span className="text-red-300 font-bold text-[10px] uppercase tracking-wider">Escuchando...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                <span className="text-indigo-300 font-bold text-[10px] uppercase tracking-wider">Procesando...</span>
              </>
            )}
            <button
              onClick={cancelRecording}
              className="ml-auto text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-gray-200 leading-relaxed min-h-[1.2em]">
            {transcript || <span className="text-gray-500 italic">Habla ahora...</span>}
          </p>
          {/* Triángulo apuntando al botón */}
          <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-gray-900 rotate-45" />
        </div>
      )}

      {/* Botón principal */}
      <button
        type="button"
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
        onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
        disabled={disabled}
        title={state === 'idle' ? 'Mantené presionado para hablar' : ''}
        className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all select-none
          ${state === 'recording'
            ? 'bg-red-500 shadow-lg shadow-red-300 scale-110'
            : state === 'processing'
            ? 'bg-indigo-400 cursor-wait'
            : 'bg-gray-100 hover:bg-indigo-100 active:bg-indigo-200 active:scale-95'
          }
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {/* Ondas de grabación */}
        {state === 'recording' && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40" />
            <span className="absolute inset-[-6px] rounded-full border-2 border-red-300 animate-pulse opacity-60" />
          </>
        )}

        {state === 'recording' ? (
          <MicOff className="w-5 h-5 text-white relative z-10" />
        ) : (
          <Mic className={`w-5 h-5 relative z-10 ${state === 'processing' ? 'text-white' : 'text-gray-500'}`} />
        )}
      </button>
    </div>
  );
}

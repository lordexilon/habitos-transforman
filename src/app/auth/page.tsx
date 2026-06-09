'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLogin, setIsLogin] = useState(false); // Por defecto registro para atraer usuarios
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/'); // Redirigir al inicio o a la agenda
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Supabase puede requerir confirmación de email, pero por defecto en MVP suele auto-loguear si el email auth no requiere confirmación obligatoria.
        // Asumimos que auto-loguea o pedimos al usuario revisar su correo si es necesario.
        alert("¡Cuenta creada exitosamente! Comienza a ganar puntos.");
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-10" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-10" />

      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl z-10">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-1">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span className="font-black text-gray-800 tracking-tight">SCA<span className="text-indigo-600">Hábitos</span></span>
          </div>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">
          {isLogin ? 'Bienvenido de vuelta' : 'Desbloquea tu potencial'}
        </h1>
        <p className="text-sm text-gray-500 mb-8 font-medium">
          {isLogin 
            ? 'Retoma el control de tus hábitos y mantén tus rachas vivas.' 
            : 'Regístrate para guardar tus puntos, armar tu agenda y hablar con tu Coach IA sin límites.'}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Correo Electrónico</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-bold hover:bg-indigo-700 transition-colors shadow-md mt-4 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {isLogin ? 'Ingresar' : 'Crear Cuenta Gratis'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {isLogin ? '¿Aún no tienes cuenta?' : '¿Ya tienes una cuenta?'}
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="ml-2 font-bold text-indigo-600 hover:text-indigo-800"
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

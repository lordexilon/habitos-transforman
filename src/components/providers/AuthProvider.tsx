'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  swRegistration: ServiceWorkerRegistration | null;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  swRegistration: null,
});

export const useAuth = () => useContext(AuthContext);

/**
 * Registra el Service Worker con reintentos.
 * El SW de @ducanh2912/next-pwa ya importa sw-push.js en producción.
 * En desarrollo el PWA está deshabilitado, por lo que usamos sw-push.js directamente.
 */
async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;

  try {
    // En producción el SW principal ya existe (generado por next-pwa)
    // En desarrollo registramos sw-push.js directamente para testeo
    const swUrl = process.env.NODE_ENV === 'production' ? '/sw.js' : '/sw-push.js';
    const registration = await navigator.serviceWorker.register(swUrl, { scope: '/' });
    console.log('✅ Service Worker registrado:', registration.scope);
    return registration;
  } catch (err) {
    console.warn('⚠️ Service Worker registration failed:', err);
    return null;
  }
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Registrar Service Worker al montar (una sola vez)
  useEffect(() => {
    registerServiceWorker().then(reg => {
      if (reg) setSwRegistration(reg);
    });
  }, []);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut, swRegistration }}>
      {children}
    </AuthContext.Provider>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Flame, Star, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, session, signOut, loading } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [localPoints, setLocalPoints] = useState('0');
  const [localStreak, setLocalStreak] = useState('0');

  useEffect(() => {
    if (!loading && !session) {
      router.push('/auth');
    }
  }, [session, loading, router]);

  useEffect(() => {
    // Para el MVP, mostramos los datos locales.
    const userId = session?.user?.id || 'guest';
    setLocalPoints(localStorage.getItem(`user_points_${userId}`) || '0');
    setLocalStreak(localStorage.getItem(`user_streak_${userId}`) || '0');
  }, [session]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 relative p-6">
      <h1 className="text-2xl font-black text-gray-900 mb-8 mt-4 flex items-center gap-2">
        <UserIcon className="w-6 h-6 text-indigo-600" />
        Mi Perfil
      </h1>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cuenta</p>
            <p className="font-semibold text-gray-800">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-orange-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Flame className="w-8 h-8 text-orange-500 mb-2" />
            <p className="text-2xl font-black text-gray-900">{localStreak}</p>
            <p className="text-xs font-bold text-gray-500">Racha Actual</p>
          </div>
          <div className="bg-yellow-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Star className="w-8 h-8 text-yellow-500 mb-2" />
            <p className="text-2xl font-black text-gray-900">{localPoints}</p>
            <p className="text-xs font-bold text-gray-500">Puntos Totales</p>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-8">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center justify-center gap-2 bg-white border-2 border-red-100 text-red-500 font-bold py-4 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSigningOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

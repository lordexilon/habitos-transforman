'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Flame, Star, Loader2, Bell, BellOff, AlertCircle } from 'lucide-react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function ProfilePage() {
  const { user, session, signOut, loading, swRegistration } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [localPoints, setLocalPoints] = useState('0');
  const [vapidError, setVapidError] = useState(false);
  const [localStreak, setLocalStreak] = useState('0');
  
  // Push Notification States
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isPushLoading, setIsPushLoading] = useState(false);

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

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(sub => {
          setPushEnabled(!!sub);
        });
      }).catch(err => console.warn("SW ready failed:", err));
    }
  }, []);

  const togglePushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Las notificaciones push no están soportadas en este dispositivo/navegador.');
      return;
    }

    setIsPushLoading(true);
    setVapidError(false);
    try {
      // Usar el registro del SW ya disponible desde AuthProvider (evita cuelgues de serviceWorker.ready)
      const registration = swRegistration || await navigator.serviceWorker.ready;

      if (pushEnabled) {
        // Desactivar
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) await subscription.unsubscribe();
        setPushEnabled(false);
      } else {
        // Activar: pedir permiso primero
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          alert('Permiso denegado. Habilita las notificaciones en la configuración de tu navegador.');
          setIsPushLoading(false);
          return;
        }

        // Obtener la clave pública VAPID del backend
        const res = await fetch('/api/push/subscribe');
        if (!res.ok) throw new Error('No se pudo obtener la llave pública VAPID del servidor.');
        const { publicKey, error: vapidErr } = await res.json();

        // Validar que las keys VAPID estén configuradas en el servidor
        if (!publicKey || publicKey.length < 10) {
          setVapidError(true);
          setIsPushLoading(false);
          return;
        }

        const convertedKey = urlBase64ToUint8Array(publicKey);
        const newSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey
        });

        // Registrar suscripción en base de datos
        const saveRes = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: newSubscription })
        });
        if (!saveRes.ok) throw new Error('Fallo al registrar la suscripción en el servidor.');

        // Enviar notificación de bienvenida de prueba
        await fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: '¡Notificaciones Activas! 🔔',
            body: 'Tu Coach te enviará recordatorios diarios de tus hábitos.',
            userId: session?.user?.id || null
          })
        });

        setPushEnabled(true);
      }
    } catch (e: any) {
      console.error('Error toggling push:', e);
      alert('Error al configurar notificaciones: ' + e.message);
    } finally {
      setIsPushLoading(false);
    }
  };

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

      {/* Configuración de Notificaciones */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
        <h3 className="font-black text-gray-800 text-base mb-4 flex items-center gap-2">
          {pushEnabled ? <Bell className="w-5 h-5 text-indigo-600" /> : <BellOff className="w-5 h-5 text-gray-400" />}
          Notificaciones del Coach
        </h3>
        <p className="text-gray-500 text-xs font-semibold mb-4 leading-relaxed">
          Recibe recordatorios diarios para tus hábitos de la agenda y alertas de retrospectivas los viernes por la noche.
        </p>

        {/* Alerta cuando VAPID no está configurado en el servidor */}
        {vapidError && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-amber-700 text-xs font-bold">Configuración pendiente</p>
              <p className="text-amber-600 text-xs mt-0.5 leading-relaxed">
                Las variables <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_VAPID_PUBLIC_KEY</code> y <code className="bg-amber-100 px-1 rounded">VAPID_PRIVATE_KEY</code> deben estar configuradas en Vercel para activar las notificaciones push.
              </p>
            </div>
          </div>
        )}

        <button
          onClick={togglePushNotifications}
          disabled={isPushLoading}
          className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 text-sm shadow-sm ${
            pushEnabled
              ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-100'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
          }`}
        >
          {isPushLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : pushEnabled ? (
            'Desactivar Recordatorios'
          ) : (
            'Activar Recordatorios'
          )}
        </button>
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

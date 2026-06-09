'use client';
import React, { useEffect, useState } from 'react';

export default function TopBar() {
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Escuchar el evento personalizado de ganancia de puntos
    const handleStorageChange = () => {
      setPoints(Number(localStorage.getItem('user_points') || '0'));
      setStreak(Number(localStorage.getItem('user_streak') || '0'));
    };

    handleStorageChange();
    window.addEventListener('pointsUpdated', handleStorageChange);
    return () => window.removeEventListener('pointsUpdated', handleStorageChange);
  }, []);

  return (
    <div className="fixed top-0 left-auto right-auto w-full max-w-md h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 z-50 shadow-sm">
      <div className="font-extrabold text-gray-900 text-xl tracking-tight">SCA<span className="text-indigo-500">Hábitos</span></div>
      <div className="flex items-center gap-5 font-black text-lg">
        <div className="flex items-center gap-1.5 text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
          <span className="text-xl pb-0.5">🔥</span> {streak}
        </div>
        <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-50 px-3 py-1 rounded-full">
          <span className="text-xl pb-0.5">⭐</span> {points}
        </div>
      </div>
    </div>
  );
}

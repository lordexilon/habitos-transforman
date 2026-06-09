'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, Target, ShieldBan, HeartPulse, Home, MessageCircleMore, CheckSquare, BookOpen, User } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

const navItems = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Agenda', href: '/agenda', icon: CheckSquare },
  { name: 'Libro', href: '/libro', icon: BookOpen },
  { name: 'Coach', href: '/coach', icon: MessageCircleMore },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { session } = useAuth();

  // El usuario solicitó mantener el BottomNav visible en el chat

  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-md z-50 bg-white/80 backdrop-blur-md border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16 w-full px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] font-medium leading-none">{item.name}</span>
            </Link>
          );
        })}
        {/* Enlace Condicional a Perfil/Auth */}
        <Link
          href={session ? '/perfil' : '/auth'}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            pathname === '/auth' || pathname === '/perfil' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <User className={`w-6 h-6 ${pathname === '/auth' || pathname === '/perfil' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] font-medium leading-none">{session ? 'Perfil' : 'Ingresar'}</span>
        </Link>
      </div>
    </nav>
  );
}

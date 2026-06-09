'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, Target, ShieldBan, HeartPulse, Home, MessageCircleMore } from 'lucide-react';

const navItems = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Ciencia', href: '/ciencia-del-habito', icon: Brain },
  { name: 'Coach', href: '/coach', icon: MessageCircleMore },
  { name: 'Sistemas', href: '/sistemas-vs-metas', icon: Target },
  { name: 'Erradicación', href: '/erradicacion-y-reemplazo', icon: ShieldBan },
  { name: 'Ecosistema', href: '/ecosistema-vida-sana', icon: HeartPulse },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Ocultar BottomNav en la vista inmersiva del chat
  if (pathname === '/coach') return null;

  return (
    <nav className="fixed bottom-0 left-auto right-auto w-full max-w-md z-50 bg-white/80 backdrop-blur-md border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16 w-full mx-auto px-2">
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
      </div>
    </nav>
  );
}

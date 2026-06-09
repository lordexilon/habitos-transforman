import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export default function Logo({ className = "w-10 h-10", showText = false, textClassName = "text-3xl" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${showText ? 'justify-center' : ''}`}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" /> {/* indigo-600 */}
            <stop offset="100%" stopColor="#3b82f6" /> {/* blue-500 */}
          </linearGradient>
          <linearGradient id="gradient-teal" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" /> {/* cyan-500 */}
            <stop offset="100%" stopColor="#10b981" /> {/* emerald-500 */}
          </linearGradient>
        </defs>
        
        {/* Abstract S & C interconnected shapes forming a brain-like structure */}
        <path 
          d="M30 70 C 30 50, 70 50, 70 30" 
          stroke="url(#gradient-blue)" 
          strokeWidth="12" 
          strokeLinecap="round"
        />
        <path 
          d="M70 70 C 70 50, 30 50, 30 30" 
          stroke="url(#gradient-teal)" 
          strokeWidth="12" 
          strokeLinecap="round"
          style={{ mixBlendMode: 'multiply' }}
        />
        
        <circle cx="30" cy="70" r="8" fill="#4f46e5" />
        <circle cx="70" cy="30" r="8" fill="#10b981" />
      </svg>
      {showText && (
        <span className={`font-extrabold text-gray-900 tracking-tight ${textClassName}`}>
          SCA<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Hábitos</span>
        </span>
      )}
    </div>
  );
}

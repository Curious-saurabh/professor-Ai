import React from 'react';

export const ProfessorAILogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="faceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FDB813', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#0077B6', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    
    {/* Face */}
    <circle cx="50" cy="50" r="45" fill="url(#faceGradient)" />
    
    {/* Smile */}
    <path d="M30 60 Q 50 75 70 60" stroke="#1E293B" strokeWidth="3" fill="none" strokeLinecap="round" />
    
    {/* Glasses */}
    <g stroke="#1E293B" strokeWidth="4" fill="none">
      {/* Left Lens */}
      <circle cx="35" cy="48" r="10" />
      {/* Right Lens */}
      <circle cx="65" cy="48" r="10" />
      {/* Bridge */}
      <path d="M45 48 H 55" />
    </g>
    
    {/* Graduation Cap */}
    <g fill="#1E293B">
      {/* Mortarboard */}
      <path d="M10 30 L50 10 L90 30 L50 50 Z" />
      {/* Cap base */}
      <path d="M20 32 Q 50 42 80 32 L 80 38 Q 50 48 20 38 Z" />
      {/* Tassel */}
      <line x1="78" y1="23" x2="78" y2="40" stroke="#FDB813" strokeWidth="2.5" />
      <circle cx="78" cy="23" r="3" fill="#FDB813" />
    </g>
  </svg>
);
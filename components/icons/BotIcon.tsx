import React from 'react';

export const BotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <radialGradient id="bot-eye-grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" style={{ stopColor: '#80DEEA', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#00ACC1', stopOpacity: 1 }} />
      </radialGradient>
      <linearGradient id="bot-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#ECEFF1', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#B0BEC5', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    
    {/* Main Body */}
    <circle cx="50" cy="55" r="40" fill="url(#bot-body-grad)" />
    <circle cx="50" cy="55" r="38" fill="#FFFFFF" />

    {/* Visor */}
    <path d="M20,50 h60 a5,5 0 0 1 0,15 h-60 a5,5 0 0 1 0,-15 Z" transform="translate(0, -5)" fill="#455A64" />
    
    {/* Eyes */}
    <circle cx="38" cy="52" r="10" fill="url(#bot-eye-grad)" />
    <circle cx="62" cy="52" r="10" fill="url(#bot-eye-grad)" />

    {/* Eye Sparkles */}
    <path d="M34,48 L37,51 L40,48 L37,45 Z" fill="#FFFFFF" />
    <path d="M58,48 L61,51 L64,48 L61,45 Z" fill="#FFFFFF" />

    {/* Head Line */}
    <path d="M30 28 Q 50 20 70 28" stroke="#B0BEC5" strokeWidth="2" fill="none" />
    
    {/* Mouth */}
    <path d="M48 66 L50 69 L52 66" stroke="#78909C" strokeWidth="2" fill="none" strokeLinecap="round" />
    
    {/* Side Wings */}
    <path d="M15 70 C 5 75, 5 85, 20 83" fill="#E0E5EC" stroke="#B0BEC5" strokeWidth="1.5" />
    <path d="M85 70 C 95 75, 95 85, 80 83" fill="#E0E5EC" stroke="#B0BEC5" strokeWidth="1.5" />

    {/* Bottom Glow Line */}
    <path d="M35 85 Q 50 90 65 85" stroke="#00BCD4" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);
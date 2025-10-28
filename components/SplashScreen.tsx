import React from 'react';
import { ProfessorAILogo } from './icons/ProfessorAILogo';

export const SplashScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 animate-fade-in font-sans">
      <div className="text-center flex flex-col items-center">
        <ProfessorAILogo className="w-32 h-32 mx-auto mb-6 animate-pop-in" />
        <h1 className="text-5xl font-extrabold text-slate-100 tracking-tight animate-fade-in-up animation-delay-300">
          PROFESSOR <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">AI</span>
        </h1>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pop-in {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-pop-in { animation: pop-in 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; opacity: 0; }
        .animation-delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
};
import React from 'react';
import { GoogleIcon } from './icons/GoogleIcon';
import { ProfessorAILogo } from './icons/ProfessorAILogo';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100 p-4 font-sans">
      <div className="text-center w-full max-w-md">
        <header className="mb-12 flex flex-col items-center gap-4">
          <ProfessorAILogo className="w-20 h-20 sm:w-24 sm:h-24" />
          <h1 className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Professor AI
          </h1>
          <p className="text-slate-400 mt-2 text-xl">
            Your personal AI tutor.
          </p>
        </header>

        <main className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
            <h2 className="text-2xl font-semibold text-slate-100 mb-2">Welcome Back!</h2>
            <p className="text-slate-400 mb-8">Sign in to continue your learning journey.</p>
            <button
                onClick={onLogin}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-slate-800 font-semibold text-lg rounded-lg shadow-md hover:bg-slate-200 transition-all duration-300 transform hover:scale-105"
            >
                <GoogleIcon className="w-6 h-6" />
                <span>Sign in with Google</span>
            </button>
        </main>
        
        <footer className="mt-12 text-slate-500 text-sm">
            <p>Sign in to save and access your study history.</p>
        </footer>
      </div>
    </div>
  );
};
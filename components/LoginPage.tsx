
import React from 'react';
import { GoogleIcon } from './icons/GoogleIcon';
import { ProfessorAILogo } from './icons/ProfessorAILogo';

interface LoginPageProps {
  onGoogleLogin: () => void;
  configError?: string | null;
  error?: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onGoogleLogin, configError, error }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100 p-4 font-sans">
      <div className="text-center w-full max-w-sm">
        <header className="mb-10 flex flex-col items-center gap-4">
          <ProfessorAILogo className="w-16 h-16 sm:w-20 sm:h-20" />
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Professor AI
          </h1>
          <p className="text-slate-400 text-lg">Your personal AI tutor.</p>
        </header>

        <main className="bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl shadow-cyan-500/10 p-6 sm:p-8">
            {configError && (
              <div className="mb-6 p-3 bg-red-900/50 border border-red-700 rounded-lg text-center text-sm text-red-300">
                {configError}
              </div>
            )}
            {error && (
              <div className="mb-6 p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg text-center text-sm text-yellow-300">
                {error}
              </div>
            )}
            
            <button 
                onClick={onGoogleLogin} 
                disabled={!!configError}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-slate-800 font-semibold text-lg rounded-lg shadow-md hover:bg-slate-200 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
            >
                <GoogleIcon className="w-6 h-6" />
                <span>Sign in with Google</span>
            </button>
        </main>

        <footer className="mt-8 text-slate-500 text-sm">
            <p>Sign in to save and access your study history.</p>
        </footer>
      </div>
    </div>
  );
};

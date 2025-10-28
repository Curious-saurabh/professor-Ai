
import React from 'react';
import { ProfessorAILogo } from './icons/ProfessorAILogo';

interface ConfigErrorPageProps {
  missingKeys: {
    gemini: boolean;
    firebase: boolean;
  };
}

export const ConfigErrorPage: React.FC<ConfigErrorPageProps> = ({ missingKeys }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-3xl w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-8 shadow-2xl shadow-red-500/10">
        <header className="flex flex-col items-center text-center mb-8">
          <ProfessorAILogo className="w-16 h-16 mb-4" />
          <h1 className="text-3xl font-bold text-red-400">Application Not Configured</h1>
          <p className="text-slate-400 mt-2">
            This application requires API keys to function, but they are missing from the deployment environment.
          </p>
        </header>

        <div className="space-y-6">
          {missingKeys.gemini && (
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <h2 className="text-xl font-semibold text-amber-400">1. Gemini API Key (Missing)</h2>
              <p className="text-slate-300 mt-2 mb-4">
                The AI analysis and chat features require a Google Gemini API key.
              </p>
              <ol className="list-decimal list-inside space-y-2 text-slate-400 text-sm">
                <li>
                  Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">Google AI Studio</a> to create an API key.
                </li>
                <li>
                  In your Netlify project, go to <span className="font-mono bg-slate-700 p-1 rounded">Site configuration &gt; Environment variables</span>.
                </li>
                <li>
                  Add a new variable with the key <code className="font-mono bg-slate-700 p-1 rounded">API_KEY</code> and paste your key as the value.
                </li>
                <li>
                  <strong>Redeploy your site</strong> to apply the new environment variable.
                </li>
              </ol>
            </div>
          )}

          {missingKeys.firebase && (
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <h2 className="text-xl font-semibold text-amber-400">2. Firebase Configuration (Incomplete)</h2>
              <p className="text-slate-300 mt-2 mb-4">
                User authentication (Google Sign-in) requires a Firebase project configuration.
              </p>
              <ol className="list-decimal list-inside space-y-2 text-slate-400 text-sm">
                <li>
                  Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">Firebase Console</a> and select your project.
                </li>
                <li>
                  Go to <span className="font-mono bg-slate-700 p-1 rounded">Project Settings</span> (gear icon) and find your web app's configuration object under "SDK setup and configuration".
                </li>
                <li>
                  In Netlify, add the following environment variables with their corresponding values from Firebase:
                  <ul className="list-disc list-inside mt-2 pl-4 space-y-1">
                    <li><code className="font-mono bg-slate-700 p-1 rounded">FIREBASE_API_KEY</code></li>
                    <li><code className="font-mono bg-slate-700 p-1 rounded">FIREBASE_AUTH_DOMAIN</code></li>
                    <li><code className="font-mono bg-slate-700 p-1 rounded">FIREBASE_PROJECT_ID</code></li>
                    <li><code className="font-mono bg-slate-700 p-1 rounded">FIREBASE_STORAGE_BUCKET</code></li>
                    <li><code className="font-mono bg-slate-700 p-1 rounded">FIREBASE_MESSAGING_SENDER_ID</code></li>
                    <li><code className="font-mono bg-slate-700 p-1 rounded">FIREBASE_APP_ID</code></li>
                  </ul>
                </li>
                 <li>
                  <strong>Redeploy your site</strong> to apply the new environment variables.
                </li>
              </ol>
            </div>
          )}
        </div>

        <footer className="text-center mt-8 text-slate-500 text-sm">
            <p>Once you have configured these variables and redeployed, the application will function correctly.</p>
        </footer>
      </div>
    </div>
  );
};

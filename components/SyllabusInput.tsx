
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface ContentInputProps {
  contentText: string;
  setContentText: (text: string) => void;
  handleAnalyze: () => void;
}

export const ContentInput: React.FC<ContentInputProps> = ({ contentText, setContentText, handleAnalyze }) => {
  return (
    <div className="flex flex-col gap-6">
      <textarea
        value={contentText}
        onChange={(e) => setContentText(e.target.value)}
        placeholder="Paste your academic content here..."
        className="w-full h-80 p-4 bg-slate-800 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-300 placeholder-slate-500 resize-none"
      />
      <button
        onClick={handleAnalyze}
        disabled={!contentText.trim()}
        className="self-center flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
      >
        <SparklesIcon className="w-6 h-6" />
        Analyze Content
      </button>
    </div>
  );
};
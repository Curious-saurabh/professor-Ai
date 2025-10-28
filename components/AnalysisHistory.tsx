import React from 'react';
import { AnalysisSession } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { TrashIcon } from './icons/TrashIcon';

interface AnalysisHistoryProps {
  history: AnalysisSession[];
  onSelect: (session: AnalysisSession) => void;
  onDelete: (timestamp: number) => void;
  onClearAll: () => void;
  onBack: () => void;
}

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ history, onSelect, onDelete, onClearAll, onBack }) => {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <header className="flex justify-between items-center pb-4 border-b border-slate-700">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors" aria-label="Back to main view">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                Analysis History
            </h2>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-400 bg-red-900/40 hover:bg-red-900/70 border border-red-800 rounded-lg transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
            Clear All
          </button>
        )}
      </header>

      {history.length > 0 ? (
        <div className="space-y-4">
          {history.map((session) => (
            <div
              key={session.timestamp}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-800 transition-colors"
            >
              <div className="flex-grow">
                <p className="font-semibold text-slate-200">
                  {session.analysisResult.chapters[0]?.chapterTitle || "Analysis"}
                </p>
                <p className="text-sm text-slate-400">
                  {new Date(session.timestamp).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-2 italic line-clamp-1">
                    {session.contentText}
                </p>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                    onClick={() => onSelect(session)}
                    className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors"
                >
                    View
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(session.timestamp);
                  }}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-full transition-colors"
                  aria-label="Delete analysis"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-slate-800/50 border border-dashed border-slate-700 rounded-lg">
          <h3 className="text-xl font-semibold text-slate-300">No History Found</h3>
          <p className="text-slate-500 mt-2">Your analyzed content will appear here.</p>
        </div>
      )}
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
        .line-clamp-1 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
        }
      `}</style>
    </div>
  );
};
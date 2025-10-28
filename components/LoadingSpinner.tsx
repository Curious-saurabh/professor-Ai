
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 gap-4">
      <div className="w-16 h-16 border-4 border-t-transparent border-cyan-400 border-solid rounded-full animate-spin"></div>
      <p className="text-lg text-slate-300 font-semibold">
        Professor AI is analyzing your content...
      </p>
      <p className="text-slate-400 text-center">This may take a moment for detailed content.</p>
    </div>
  );
};
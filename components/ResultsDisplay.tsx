import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnalysisResult, Chapter } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';

interface ResultsDisplayProps {
  result: AnalysisResult;
  handleDownloadPdf: () => void;
  handleReset: () => void;
  isDownloadingPdf: boolean;
  onTextSelect: (selectedText: string) => void;
}

const TextSelectionPopup: React.FC<{
  x: number;
  y: number;
  text: string;
  onAsk: (text: string) => void;
}> = ({ x, y, text, onAsk }) => {
  return (
    <div
      className="fixed z-50"
      style={{ left: `${x}px`, top: `${y}px` }}
      onMouseDown={(e) => e.preventDefault()} // Prevent text deselection
    >
      <button
        onClick={() => onAsk(text)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-cyan-500 text-white font-semibold text-sm rounded-lg shadow-xl shadow-cyan-500/20 transform transition-all hover:scale-105 hover:bg-slate-800"
      >
        <ChatBubbleIcon className="w-5 h-5" />
        Ask Professor AI
      </button>
    </div>
  );
};

const ChapterAccordion: React.FC<{ chapter: Chapter }> = ({ chapter }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden mb-4 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 flex justify-between items-center bg-slate-800 hover:bg-slate-700/50 transition-colors"
      >
        <h2 className="text-xl font-bold text-cyan-300">{chapter.chapterTitle}</h2>
        <ChevronDownIcon
          className={`w-6 h-6 transform transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="p-4 md:p-6 space-y-6">
          {chapter.topics.map((topic, topicIndex) => (
            <div key={topicIndex} className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-lg font-semibold text-slate-100 mb-2">{topic.title}</h3>
              <div
                className="prose prose-invert prose-sm sm:prose-base max-w-none text-slate-300 explanation-content"
                dangerouslySetInnerHTML={{ __html: topic.explanation.replace(/\n/g, '<br />') }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PdfContent: React.FC<{ result: AnalysisResult }> = ({ result }) => (
    <div id="pdf-export-content" className="p-8 bg-slate-900 text-slate-100 font-sans">
      <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Professor AI
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Your Personal Study Guide</p>
      </div>
      <div className="space-y-8">
        {result.chapters.map((chapter, chapterIndex) => (
          <div key={chapterIndex} className="p-6 border border-slate-700 rounded-lg break-inside-avoid">
            <h2 className="text-2xl font-bold text-cyan-300 mb-6 pb-2 border-b border-slate-600">{chapter.chapterTitle}</h2>
            <div className="space-y-6">
              {chapter.topics.map((topic, topicIndex) => (
                <div key={topicIndex} className="border-l-4 border-purple-500 pl-4 break-inside-avoid">
                  <h3 className="text-xl font-semibold text-slate-100 mb-2">{topic.title}</h3>
                  <div
                    className="prose prose-invert prose-base max-w-none text-slate-300"
                    dangerouslySetInnerHTML={{ __html: topic.explanation.replace(/\n/g, '<br />') }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, handleDownloadPdf, handleReset, isDownloadingPdf, onTextSelect }) => {
  const [popup, setPopup] = useState<{ visible: boolean; x: number; y: number; text: string }>({ visible: false, x: 0, y: 0, text: '' });
  const displayRef = useRef<HTMLDivElement>(null);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() ?? '';

    if (selection && selectedText.length > 5 && displayRef.current?.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setPopup({
            visible: true,
            x: rect.left + window.scrollX + rect.width / 2 - 80, // Center the popup
            y: rect.top + window.scrollY - 50, // Position above the selection
            text: selectedText,
        });
    } else {
        setPopup(prev => ({ ...prev, visible: false }));
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleSelection);
    return () => {
      document.removeEventListener('mouseup', handleSelection);
    };
  }, [handleSelection]);
  
  return (
    <div ref={displayRef} className="flex flex-col gap-8">
      {popup.visible && (
        <TextSelectionPopup
            x={popup.x}
            y={popup.y}
            text={popup.text}
            onAsk={(text) => {
                onTextSelect(text);
                setPopup({ ...popup, visible: false });
            }}
        />
      )}
      <div className="absolute -left-[9999px] top-0 w-[800px]" aria-hidden="true">
        <PdfContent result={result} />
      </div>

      <div className="p-4 sm:p-6 bg-slate-900 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Your Personalized Study Guide
        </h2>
        {result.chapters.map((chapter, index) => (
          <ChapterAccordion key={index} chapter={chapter} />
        ))}
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
         <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-base rounded-full shadow-lg hover:shadow-green-500/40 transform hover:scale-105 transition-all duration-300 disabled:opacity-75 disabled:scale-100 disabled:cursor-wait"
        >
            {isDownloadingPdf ? (
                <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Generating PDF...</span>
                </>
            ) : (
                <>
                    <DownloadIcon className="w-5 h-5" />
                    <span>Download as PDF</span>
                </>
            )}
        </button>
         <button
            onClick={handleReset}
            disabled={isDownloadingPdf}
            className="w-full sm:w-auto px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-full transition-colors disabled:opacity-75"
        >
            Analyze Another
        </button>
      </div>
       <style>{`
        .explanation-content strong {
          color: #FDBA74; /* A nice orange color for emphasis */
          font-weight: 600;
        }
        .explanation-content h3 {
            font-size: 1.25em;
            color: #93C5FD;
            border-bottom: 1px solid #475569;
            padding-bottom: 4px;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
        }
       `}</style>
    </div>
  );
};
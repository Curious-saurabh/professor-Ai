import React, { useState, useCallback, useEffect } from 'react';
import { ContentInput } from './components/SyllabusInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { analyzeContent } from './services/geminiService';
import { AnalysisResult, User, AnalysisSession } from './types';
import { LoginPage } from './components/LoginPage';
import { ProfessorBot } from './components/ProfessorBot';
import { SplashScreen } from './components/SplashScreen';
import { ProfessorAILogo } from './components/icons/ProfessorAILogo';
import { AnalysisHistory } from './components/AnalysisHistory';
import { HistoryIcon } from './components/icons/HistoryIcon';


// This is required for jsPDF and html2canvas to be available globally from the CDN
declare const jspdf: any;
declare const html2canvas: any;

const ANALYSIS_HISTORY_KEY = 'professorAiAnalysisHistory';

export default function App() {
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  const [contentText, setContentText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [appView, setAppView] = useState<'main' | 'history'>('main');
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisSession[]>([]);

  // --- Bot State ---
  const [isBotOpen, setIsBotOpen] = useState<boolean>(false);
  const [contextualQuestion, setContextualQuestion] = useState<string | null>(null);


  // --- Splash Screen & History Loading ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2500); // Show splash screen for 2.5 seconds
    
    try {
        const savedHistory = localStorage.getItem(ANALYSIS_HISTORY_KEY);
        if (savedHistory) {
            setAnalysisHistory(JSON.parse(savedHistory));
        }
    } catch (error) {
        console.error("Failed to load or parse analysis history:", error);
        localStorage.removeItem(ANALYSIS_HISTORY_KEY);
    }

    return () => clearTimeout(timer);
  }, []);


  // --- Auth Handlers ---
  const handleLogin = () => {
    setUser({ name: 'Saurabh', email: 'saurabh@example.com' });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    handleReset();
    setAnalysisHistory([]);
    localStorage.removeItem(ANALYSIS_HISTORY_KEY);
    localStorage.removeItem('professorAiChatHistory');
    setAppView('main');
  };

  // --- App Logic Handlers ---
  const handleAnalyze = useCallback(async () => {
    if (!contentText.trim()) {
      setError('Please paste your content first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeContent(contentText);
      setAnalysisResult(result);

      const newSession: AnalysisSession = {
        timestamp: Date.now(),
        contentText: contentText,
        analysisResult: result,
      };
      setAnalysisHistory(prevHistory => {
          const updatedHistory = [newSession, ...prevHistory];
          localStorage.setItem(ANALYSIS_HISTORY_KEY, JSON.stringify(updatedHistory));
          return updatedHistory;
      });

    } catch (err) {
      console.error(err);
      setError('An error occurred while analyzing the content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [contentText]);

  const handleDownloadPdf = useCallback(() => {
    const input = document.getElementById('pdf-export-content');
    if (!input) {
        console.error("PDF export content element not found");
        setError("Could not generate PDF. The content element is missing.");
        return;
    }

    setIsDownloadingPdf(true);

    const scale = 2;
    html2canvas(input, {
        scale: scale,
        useCORS: true,
        backgroundColor: '#0f172a'
    }).then((canvas: HTMLCanvasElement) => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = jspdf;
        
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width / scale, canvas.height / scale],
            hotfixes: ['px_scaling'],
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / scale, canvas.height / scale);
        pdf.save('professor-ai-analysis.pdf');
    }).catch((err: any) => {
        console.error("Error generating PDF:", err);
        setError("An unexpected error occurred while generating the PDF.");
    }).finally(() => {
        setIsDownloadingPdf(false);
    });
  }, []);
  
  const handleReset = () => {
    setContentText('');
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
    setAppView('main');
  };

  // --- History Handlers ---
  const handleSelectHistoryItem = (session: AnalysisSession) => {
    setAnalysisResult(session.analysisResult);
    setContentText(session.contentText);
    setAppView('main');
  };

  const handleDeleteHistoryItem = (timestamp: number) => {
    setAnalysisHistory(prevHistory => {
        const updatedHistory = prevHistory.filter(item => item.timestamp !== timestamp);
        localStorage.setItem(ANALYSIS_HISTORY_KEY, JSON.stringify(updatedHistory));
        return updatedHistory;
    });
  };

  const handleClearAllHistory = () => {
    if (window.confirm("Are you sure you want to delete all analysis history? This cannot be undone.")) {
        setAnalysisHistory([]);
        localStorage.removeItem(ANALYSIS_HISTORY_KEY);
    }
  };

  // --- Contextual Chat Handlers ---
  const handleContextualChat = (selectedText: string) => {
    setContextualQuestion(`Can you explain this concept in more detail? "${selectedText.trim()}"`);
    setIsBotOpen(true);
  };

  const clearContextualQuestion = () => {
    setContextualQuestion(null);
  };


  if (isAppLoading) {
    return <SplashScreen />;
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      <main className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="text-center flex-grow">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 flex items-center justify-center gap-3">
              <ProfessorAILogo className="w-10 h-10 sm:w-12 sm:h-12" />
              Professor AI
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Your personal AI tutor for breaking down complex academic content.</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {appView === 'main' && (
              <button
                onClick={() => setAppView('history')}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-full transition-colors"
                aria-label="View Analysis History"
              >
                <HistoryIcon className="w-6 h-6"/>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors text-sm"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </header>

        {appView === 'history' ? (
          <AnalysisHistory 
            history={analysisHistory}
            onSelect={handleSelectHistoryItem}
            onDelete={handleDeleteHistoryItem}
            onClearAll={handleClearAllHistory}
            onBack={() => setAppView('main')}
          />
        ) : isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center p-6 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : analysisResult ? (
           <ResultsDisplay 
            result={analysisResult} 
            handleDownloadPdf={handleDownloadPdf}
            handleReset={handleReset}
            isDownloadingPdf={isDownloadingPdf}
            onTextSelect={handleContextualChat}
          />
        ) : (
          <ContentInput
            contentText={contentText}
            setContentText={setContentText}
            handleAnalyze={handleAnalyze}
          />
        )}
      </main>
      
      <ProfessorBot 
        isOpen={isBotOpen}
        setIsOpen={setIsBotOpen}
        contextualQuestion={contextualQuestion}
        clearContextualQuestion={clearContextualQuestion}
      />

      <footer className="text-center mt-12 text-slate-500 text-sm">
        <p>Made by saurabh</p>
      </footer>
    </div>
  );
}
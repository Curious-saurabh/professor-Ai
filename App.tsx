
import React, { useState, useCallback, useEffect } from 'react';
import { ContentInput } from './components/SyllabusInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { analyzeContent } from './services/geminiService';
import { AnalysisResult, User, AnalysisSession, ChatMessage, ChatSession } from './types';
import { LoginPage } from './components/LoginPage';
import { ProfessorBot } from './components/ProfessorBot';
import { SplashScreen } from './components/SplashScreen';
import { ProfessorAILogo } from './components/icons/ProfessorAILogo';
import { AnalysisHistory } from './components/AnalysisHistory';
import { HistoryIcon } from './components/icons/HistoryIcon';
import { auth, googleProvider, isFirebaseConfigured, isSignInWithEmailLink, signInWithEmailLink } from './services/firebase';
import { ConfigErrorPage } from './components/ConfigErrorPage';
import { GEMINI_API_KEY } from './utils/env';


// This is required for jsPDF and html2canvas to be available globally from the CDN
declare const jspdf: any;
declare const html2canvas: any;

const isGeminiConfigured = !!GEMINI_API_KEY;


export default function App() {
  // --- Configuration Check ---
  if (!isGeminiConfigured) {
    return <ConfigErrorPage missingKeys={{ gemini: true, firebase: !isFirebaseConfigured }} />;
  }

  const [isSplashScreen, setIsSplashScreen] = useState<boolean>(true);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  // App State
  const [contentText, setContentText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [appView, setAppView] = useState<'main' | 'history'>('main');

  // History State
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisSession[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);

  // Bot State
  const [isBotOpen, setIsBotOpen] = useState<boolean>(false);
  const [contextualQuestion, setContextualQuestion] = useState<string | null>(null);


  // --- Splash Screen & Auth Loading ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashScreen(false);
    }, 2500); // Show splash screen for 2.5 seconds
    return () => clearTimeout(timer);
  }, []);

  const handleReset = useCallback(() => {
    setContentText('');
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
    setAppView('main');
  }, []);

  // --- Helpers ---
  const loadUserHistory = useCallback((uid: string) => {
    const analysisHistoryKey = `professorAiAnalysisHistory_${uid}`;
    const chatHistoryKey = `professorAiChatHistory_${uid}`;
    try {
      const savedAnalysisHistory = localStorage.getItem(analysisHistoryKey);
      setAnalysisHistory(savedAnalysisHistory ? JSON.parse(savedAnalysisHistory) : []);

      const savedChatHistory = localStorage.getItem(chatHistoryKey);
      setChatHistory(savedChatHistory ? JSON.parse(savedChatHistory) : []);
    } catch (err) {
      console.error("Failed to load or parse user history:", err);
      setAnalysisHistory([]);
      setChatHistory([]);
    }
  }, []);

  const clearUserData = useCallback(() => {
    handleReset(); // Resets main app state
    setAnalysisHistory([]);
    setChatHistory([]);
  }, [handleReset]);


  useEffect(() => {
    if (isFirebaseConfigured && auth) {
        // Handle Email Link Sign-in
        if (isSignInWithEmailLink && isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem('emailForSignIn');
            if (!email) {
                // User opened the link on a different device. To prevent session fixation
                // attacks, ask for the email again.
                email = window.prompt('Please provide your email for confirmation');
            }
            if (email) {
                signInWithEmailLink(auth, email, window.location.href)
                    .then(() => {
                        window.localStorage.removeItem('emailForSignIn');
                        // onAuthStateChanged will handle the rest
                    })
                    .catch((err: any) => {
                        console.error("Email link sign-in failed:", err);
                        setConfigError("Failed to sign in with email link. It may have expired or already been used.");
                        setIsAuthLoading(false);
                    });
            } else {
                 setIsAuthLoading(false);
            }
        }

      const unsubscribe = auth.onAuthStateChanged((firebaseUser: any) => {
        if (firebaseUser) {
          const appUser: User = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
          };
          setUser(appUser);
          loadUserHistory(appUser.uid);
        } else {
          setUser(null);
          clearUserData();
        }
        setIsAuthLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Firebase is not configured. Create a mock "Guest" user for local development.
      console.log("Firebase not configured. Running in local/guest mode.");
      const guestUser: User = {
        uid: 'local_guest_user',
        name: 'Guest User',
        email: null,
      };
      setUser(guestUser);
      loadUserHistory(guestUser.uid);
      setIsAuthLoading(false);
    }
  }, [loadUserHistory, clearUserData]);

  // Persist analysis history to localStorage when it changes
  useEffect(() => {
    if (user?.uid) {
      const analysisHistoryKey = `professorAiAnalysisHistory_${user.uid}`;
      localStorage.setItem(analysisHistoryKey, JSON.stringify(analysisHistory));
    }
  }, [analysisHistory, user]);

  // Persist chat history to localStorage when it changes
  useEffect(() => {
    if (user?.uid) {
      const chatHistoryKey = `professorAiChatHistory_${user.uid}`;
      localStorage.setItem(chatHistoryKey, JSON.stringify(chatHistory));
    }
  }, [chatHistory, user]);


  // --- Auth Handlers ---
  const handleLogin = async () => {
    setError(null);
    setConfigError(null);

    if (isFirebaseConfigured && auth && googleProvider) {
      try {
        await auth.signInWithPopup(googleProvider);
        // onAuthStateChanged will handle success
      } catch (err: any) {
        console.error("Firebase popup login failed:", err);
        switch (err.code) {
            case 'auth/popup-closed-by-user':
            case 'auth/cancelled-popup-request':
                return;
            case 'auth/operation-not-allowed':
                setConfigError("Google Sign-in is not enabled. The site owner needs to enable it in the Firebase console.");
                break;
            case 'auth/operation-not-supported-in-this-environment':
                setError("Authentication is not supported in this environment. Please try opening the app in a new tab.");
                break;
            case 'auth/popup-blocked':
                setError("The sign-in popup was blocked. Please allow popups for this site.");
                break;
            default:
                setError("An unexpected error occurred during sign-in.");
                break;
        }
      }
    }
  };

  const handleLogout = () => {
    if (isFirebaseConfigured && auth) {
      auth.signOut().catch((err: any) => {
          console.error("Firebase logout failed:", err);
          setError("An error occurred during sign-out.");
      });
    }
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
      setAnalysisHistory(prevHistory => [newSession, ...prevHistory]);

    } catch (err) {
      console.error("Analysis failed:", err);
      let errorMessage = 'An error occurred while analyzing the content. Please try again.';
      if (err instanceof Error) {
        const lowerCaseMessage = err.message.toLowerCase();
        if (lowerCaseMessage.includes("api_key") || lowerCaseMessage.includes("api key not valid")) {
          errorMessage = "The Gemini API Key is not configured correctly or is invalid. If you are the owner of this site, please check your environment variables.";
        } else if (lowerCaseMessage.includes("billing")) {
          errorMessage = "Billing is not enabled for the Google Cloud project associated with the API key. The site owner needs to enable billing to use this feature.";
        } else if (lowerCaseMessage.includes("quota")) {
          errorMessage = "The application has exceeded its API quota. Please try again later.";
        } else if (lowerCaseMessage.includes("location is not supported")) {
          errorMessage = "The AI model is not available in the region where your request is being made from. This can sometimes happen with server locations on hosting platforms.";
        }
      }
      setError(errorMessage);
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

  // --- History Handlers ---
  const handleSelectHistoryItem = (session: AnalysisSession) => {
    setAnalysisResult(session.analysisResult);
    setContentText(session.contentText);
    setAppView('main');
  };

  const handleDeleteHistoryItem = (timestamp: number) => {
    setAnalysisHistory(prevHistory => prevHistory.filter(item => item.timestamp !== timestamp));
  };

  const handleClearAllHistory = () => {
    if (window.confirm("Are you sure you want to delete all analysis history? This cannot be undone.")) {
        setAnalysisHistory([]);
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

  const handleSaveChatSession = (messages: ChatMessage[]) => {
      if (messages.length > 0) {
          const newSession: ChatSession = {
              timestamp: Date.now(),
              messages: messages,
          };
          setChatHistory(prev => [newSession, ...prev]);
      }
  };

  const isAppLoading = isSplashScreen || isAuthLoading;

  if (isAppLoading) {
    return <SplashScreen />;
  }

  if (!user) {
    return <LoginPage onGoogleLogin={handleLogin} configError={configError} error={error} />;
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
            {isFirebaseConfigured && user?.email && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors text-sm"
                aria-label="Logout"
              >
                Logout
              </button>
            )}
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
        chatHistory={chatHistory}
        onSaveSession={handleSaveChatSession}
      />

      <footer className="text-center mt-12 text-slate-500 text-sm">
        <p>Made by saurabh</p>
      </footer>
    </div>
  );
}

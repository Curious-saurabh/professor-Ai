
import React, { useState, useEffect } from 'react';
import { GoogleIcon } from './icons/GoogleIcon';
import { ProfessorAILogo } from './icons/ProfessorAILogo';
import { MailIcon } from './icons/MailIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { 
    auth, 
    setupRecaptcha, 
    sendSignInLinkToEmail,
    signInWithPhoneNumber,
    isFirebaseConfigured
} from '../services/firebase';

interface LoginPageProps {
  onGoogleLogin: () => void;
  configError?: string | null;
  error?: string | null;
}

type AuthMethod = 'email' | 'phone' | 'google';

export const LoginPage: React.FC<LoginPageProps> = ({ onGoogleLogin, configError, error }) => {
    const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
    
    // Form state
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');

    // Flow control state
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // UI feedback state
    const [localError, setLocalError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    
    // Initialize reCAPTCHA on mount
    useEffect(() => {
        if (isFirebaseConfigured && auth && !window.recaptchaVerifier) {
            setupRecaptcha('recaptcha-container');
        }
    }, []);

    const resetState = () => {
        setLocalError(null);
        setInfoMessage(null);
        setIsLoading(false);
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        resetState();
        if (!email) {
            setLocalError("Please enter your email address.");
            return;
        }
        setIsLoading(true);

        try {
            await sendSignInLinkToEmail(auth, email);
            window.localStorage.setItem('emailForSignIn', email);
            setInfoMessage(`A sign-in link has been sent to ${email}. Please check your inbox.`);
        } catch (err: any) {
            console.error("Email link error:", err);
            setLocalError(err.message || "Failed to send sign-in link. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        resetState();
        if (!phoneNumber) {
            setLocalError("Please enter your phone number.");
            return;
        }
        setIsLoading(true);

        try {
            const appVerifier = window.recaptchaVerifier;
            const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            setConfirmationResult(result);
            setIsOtpSent(true);
            setInfoMessage(`A verification code has been sent to ${phoneNumber}.`);
        } catch (err: any) {
            console.error("Phone auth error:", err);
            // This error often happens if reCAPTCHA isn't solved or is invisible and can't render.
            if (err.code === 'auth/invalid-phone-number') {
                setLocalError("Invalid phone number. Please include the country code (e.g., +1).");
            } else {
                setLocalError("Failed to send code. Please solve the reCAPTCHA if visible, or try again.");
            }
            // Reset reCAPTCHA
            window.recaptchaVerifier?.render().then((widgetId: any) => {
                if (window.grecaptcha) {
                    window.grecaptcha.reset(widgetId);
                }
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        resetState();
        if (!otp || otp.length !== 6) {
            setLocalError("Please enter the 6-digit code.");
            return;
        }
        setIsLoading(true);

        try {
            await confirmationResult.confirm(otp);
            // onAuthStateChanged will handle successful login
        } catch (err: any) {
            console.error("OTP verification error:", err);
            setLocalError("Invalid verification code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderTab = (method: AuthMethod, icon: React.ReactNode, label: string) => (
        <button
            onClick={() => { setAuthMethod(method); resetState(); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 text-sm sm:text-base font-semibold border-b-2 transition-all ${
                authMethod === method
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
            }`}
        >
            {icon}
            {label}
        </button>
    );

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

        <main className="bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl shadow-cyan-500/10">
            <div className="flex border-b border-slate-700">
                {renderTab('email', <MailIcon className="w-5 h-5" />, 'Email')}
                {renderTab('phone', <PhoneIcon className="w-5 h-5" />, 'Phone')}
                {renderTab('google', <GoogleIcon className="w-5 h-5" />, 'Google')}
            </div>
            
            <div className="p-6 sm:p-8">
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
                 {localError && (
                  <div className="mb-6 p-3 bg-red-900/50 border border-red-700 rounded-lg text-center text-sm text-red-300">
                    {localError}
                  </div>
                )}
                 {infoMessage && (
                  <div className="mb-6 p-3 bg-blue-900/50 border border-blue-700 rounded-lg text-center text-sm text-blue-300">
                    {infoMessage}
                  </div>
                )}

                {authMethod === 'email' && (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-300 placeholder-slate-500"
                        />
                        <button type="submit" disabled={isLoading} className="w-full px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-500 transition-all transform hover:scale-105 disabled:bg-slate-600 disabled:scale-100">
                            {isLoading ? 'Sending...' : 'Send Sign-in Link'}
                        </button>
                    </form>
                )}

                {authMethod === 'phone' && (
                    <form onSubmit={isOtpSent ? handleOtpSubmit : handlePhoneSubmit} className="space-y-4">
                        {!isOtpSent ? (
                             <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+1 123 456 7890"
                                className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-300 placeholder-slate-500"
                            />
                        ) : (
                            <input
                                type="number"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter 6-digit code"
                                className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-300 placeholder-slate-500"
                            />
                        )}
                        <button type="submit" disabled={isLoading} className="w-full px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-500 transition-all transform hover:scale-105 disabled:bg-slate-600 disabled:scale-100">
                            {isLoading ? 'Processing...' : (isOtpSent ? 'Verify & Sign In' : 'Send Code')}
                        </button>
                    </form>
                )}
                
                {authMethod === 'google' && (
                    <button onClick={onGoogleLogin} disabled={!!configError} className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-slate-800 font-semibold text-lg rounded-lg shadow-md hover:bg-slate-200 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100">
                        <GoogleIcon className="w-6 h-6" />
                        <span>Sign in with Google</span>
                    </button>
                )}
            </div>
        </main>
        
        {/* Container for reCAPTCHA widget - can be invisible */}
        <div id="recaptcha-container" className="flex justify-center mt-4"></div>

        <footer className="mt-8 text-slate-500 text-sm">
            <p>Sign in to save and access your study history.</p>
        </footer>
      </div>
    </div>
  );
};

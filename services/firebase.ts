
import { FIREBASE_CONFIG } from '../utils/env';

declare global {
  interface Window {
    firebase: any;
    recaptchaVerifier?: any; // To hold the reCAPTCHA instance
    grecaptcha?: any; // reCAPTCHA library
  }
}

export const isFirebaseConfigured = Object.values(FIREBASE_CONFIG).every(Boolean);

if (!isFirebaseConfigured) {
    console.warn(
        "Firebase configuration is incomplete. Authentication will be mocked for local development. " +
        "For deployment, you MUST set all VITE_FIREBASE_* environment variables."
    );
}

let app;
if (isFirebaseConfigured && window.firebase) {
    if (!window.firebase.apps.length) {
        app = window.firebase.initializeApp(FIREBASE_CONFIG);
    } else {
        app = window.firebase.app();
    }
}

export const auth = isFirebaseConfigured && window.firebase ? window.firebase.auth() : null;
export const googleProvider = isFirebaseConfigured && window.firebase ? new window.firebase.auth.GoogleAuthProvider() : null;

// --- Email Link Auth ---
const actionCodeSettings = {
    url: window.location.href,
    handleCodeInApp: true,
};

export const sendSignInLinkToEmail = (authInstance: any, email: string) => {
    return authInstance.sendSignInLinkToEmail(email, actionCodeSettings);
};

export const isSignInWithEmailLink = (authInstance: any, url: string) => {
    return authInstance.isSignInWithEmailLink(url);
};

export const signInWithEmailLink = (authInstance: any, email: string, url: string) => {
    return authInstance.signInWithEmailLink(email, url);
};


// --- Phone Auth ---
export const setupRecaptcha = (elementId: string) => {
    if (auth) {
         window.recaptchaVerifier = new window.firebase.auth.RecaptchaVerifier(auth, elementId, {
            'size': 'invisible',
            'callback': (response: any) => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
                console.log("reCAPTCHA solved");
            },
            'expired-callback': () => {
                // Response expired. Ask user to solve reCAPTCHA again.
                console.log("reCAPTCHA expired");
            }
        });
    }
};

export const signInWithPhoneNumber = (authInstance: any, phoneNumber: string, appVerifier: any) => {
    return authInstance.signInWithPhoneNumber(phoneNumber, appVerifier);
};

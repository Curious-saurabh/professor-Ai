
import { FIREBASE_CONFIG } from '../utils/env';

declare global {
  interface Window {
    firebase: any;
  }
}

// A check to see if all config values are present.
export const isFirebaseConfigured = Object.values(FIREBASE_CONFIG).every(Boolean);

if (!isFirebaseConfigured) {
    console.warn(
        "Firebase configuration is incomplete. Authentication will be mocked for local development. " +
        "For deployment on platforms like Netlify, you MUST set all VITE_FIREBASE_* environment variables."
    );
}

// Initialize Firebase only if configured and not already initialized
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
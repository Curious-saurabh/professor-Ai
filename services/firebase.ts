
import { FIREBASE_CONFIG } from '../utils/env';

declare global {
  interface Window {
    firebase: any;
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

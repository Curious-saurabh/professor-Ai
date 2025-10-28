
declare global {
  interface Window {
    firebase: any;
  }
}

// These values MUST be set as environment variables.
// For Netlify, you will set these in Site settings > Build & deploy > Environment.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// A check to see if all config values are present.
export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

if (!isFirebaseConfigured) {
    console.warn(
        "Firebase configuration is incomplete. Authentication will be mocked for local development. " +
        "For deployment on platforms like Netlify, you MUST set all FIREBASE_* environment variables."
    );
}

// Initialize Firebase only if configured and not already initialized
let app;
if (isFirebaseConfigured && window.firebase) {
    if (!window.firebase.apps.length) {
        app = window.firebase.initializeApp(firebaseConfig);
    } else {
        app = window.firebase.app();
    }
}

export const auth = isFirebaseConfigured && window.firebase ? window.firebase.auth() : null;
export const googleProvider = isFirebaseConfigured && window.firebase ? new window.firebase.auth.GoogleAuthProvider() : null;

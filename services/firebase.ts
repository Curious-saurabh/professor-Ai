declare global {
  interface Window {
    firebase: any;
  }
}

// These values are used as fallbacks if environment variables are not set.
// It's recommended to use environment variables for production.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCh-r4eSkx6s3ql3AQhTOFRtm20_bHs6qo",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "professor-ai-app.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "professor-ai-app",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "professor-ai-app.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "273873864415",
  appId: process.env.FIREBASE_APP_ID || "1:273873864415:web:02e4c3388b171384ee0b6a",
};

// A check to see if all config values are present.
export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

if (!isFirebaseConfigured) {
    console.warn(
        "Firebase configuration is incomplete or missing. Authentication will be mocked. " +
        "Please provide your Firebase project's configuration via environment variables or directly in services/firebase.ts."
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

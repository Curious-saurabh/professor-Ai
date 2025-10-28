// Vite exposes env variables via `import.meta.env`.
// Some environments (like this app's dev environment) might use `process.env`.
// This utility creates a single, reliable source of truth for environment variables.
const env = (import.meta as any).env ?? (process as any).env ?? {};

export const GEMINI_API_KEY = env.VITE_API_KEY;

export const FIREBASE_CONFIG = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

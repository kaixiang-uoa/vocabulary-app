import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};
// Check if any required config is missing (skip in test environment)
const missingConfigs = Object.entries(firebaseConfig).filter(
  ([key, value]) => !value
);
if (missingConfigs.length > 0 && process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line no-console
  console.error(
    'Missing Firebase configs:',
    missingConfigs.map(([key]) => key)
  );
  throw new Error(
    `Missing Firebase configuration: ${missingConfigs.map(([key]) => key).join(', ')}`
  );
}

// Initialize Firebase (skip in test environment)
let app: any;
let db: any;
let auth: any;

if (process.env.NODE_ENV === 'test') {
  // Mock objects for testing
  app = {};
  db = {};
  auth = {
    onAuthStateChanged: () => () => {},
    signInWithPopup: () => Promise.resolve({ user: null }),
    signOut: () => Promise.resolve(),
    currentUser: null,
  };
} else {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
}

export { auth, db };
export default app;

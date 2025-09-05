// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Firebase for testing environment
jest.mock('./config/firebase', () => ({
  app: {},
  auth: {
    onAuthStateChanged: jest.fn(callback => {
      // Simulate no user initially
      callback(null);
      // Return unsubscribe function
      return jest.fn();
    }),
    signInWithPopup: jest.fn().mockResolvedValue({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      },
    }),
    signOut: jest.fn().mockResolvedValue(undefined),
    currentUser: null,
  },
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
  },
}));

// Mock Google Auth Provider
jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'),
  GoogleAuthProvider: jest.fn(),
  getRedirectResult: jest.fn().mockResolvedValue({ user: null }),
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  writeBatch: jest.fn(),
  serverTimestamp: jest.fn(),
}));

// Set up environment variables for testing
process.env.REACT_APP_FIREBASE_API_KEY = 'test-api-key';
process.env.REACT_APP_FIREBASE_AUTH_DOMAIN = 'test-project.firebaseapp.com';
process.env.REACT_APP_FIREBASE_PROJECT_ID = 'test-project';
process.env.REACT_APP_FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com';
process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.REACT_APP_FIREBASE_APP_ID = '1:123456789:web:abcdef123456';

// Mock console methods to reduce test noise
// eslint-disable-next-line no-console
const originalError = console.error;
// eslint-disable-next-line no-console
const originalWarn = console.warn;

beforeEach(() => {
  // Suppress Firebase-related console errors/warnings in tests
  // eslint-disable-next-line no-console
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Firebase') ||
        args[0].includes('auth/operation-not-supported-in-this-environment') ||
        args[0].includes('Redirect authentication error'))
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  // eslint-disable-next-line no-console
  console.warn = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Firebase')) {
      return;
    }
    originalWarn.apply(console, args);
  };
});

afterEach(() => {
  // eslint-disable-next-line no-console
  console.error = originalError;
  // eslint-disable-next-line no-console
  console.warn = originalWarn;
});

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '0px';
  thresholds: ReadonlyArray<number> = [];

  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock Firebase configuration for tests
jest.mock("./config/firebase", () => {
  const mockAuth = {
    onAuthStateChanged: jest.fn(),
    signInWithPopup: jest.fn(),
    signOut: jest.fn(),
  };

  const mockDb = {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
      add: jest.fn(),
      where: jest.fn(),
      orderBy: jest.fn(),
      limit: jest.fn(),
    })),
  };

  return {
    auth: mockAuth,
    db: mockDb,
  };
});

// Mock Firebase services
jest.mock("./services/firebaseDataService", () => ({
  FirebaseDataService: jest.fn().mockImplementation(() => ({
    getAllData: jest.fn().mockResolvedValue({ units: [] }),
    getUnitWords: jest.fn().mockResolvedValue([]),
    addWord: jest.fn().mockResolvedValue(true),
    updateWord: jest.fn().mockResolvedValue(true),
    deleteWord: jest.fn().mockResolvedValue(true),
    createUnit: jest.fn().mockResolvedValue("mock-unit-id"),
    updateUnit: jest.fn().mockResolvedValue(true),
    deleteUnit: jest.fn().mockResolvedValue(true),
  })),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock console.error to reduce noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render is no longer supported")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

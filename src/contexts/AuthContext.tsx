import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { User } from "firebase/auth";
import { auth } from "../config/firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { initializeDataService } from "../services/dataServiceManager";
import { globalCacheManager } from "../utils/cacheManager";

// Auth state interface
export interface AuthState {
  user: User | null;
  loading: boolean;
  showLoginModal: boolean;
}

// Auth action types
export type AuthAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SHOW_LOGIN_MODAL" }
  | { type: "HIDE_LOGIN_MODAL" };

// Auth context interface
export interface AuthContextType {
  state: AuthState;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  showLoginModal: () => void;
  hideLoginModal: () => void;
}

// Initial state
const initialState: AuthState = {
  user: null,
  loading: true,
  showLoginModal: false,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        loading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "SHOW_LOGIN_MODAL":
      return {
        ...state,
        showLoginModal: true,
      };
    case "HIDE_LOGIN_MODAL":
      return {
        ...state,
        showLoginModal: false,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Listen to auth state changes
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      const previousUser = state.user;
      dispatch({ type: "SET_USER", payload: user });

      // Clear cache when user authentication state changes
      if (previousUser !== user) {
        globalCacheManager.clear();
        console.log("Cache cleared due to auth state change");
      }

      // Initialize data service based on user authentication
      initializeDataService(user?.uid || null);
    });

    // Handle redirect result on page load
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          dispatch({ type: "HIDE_LOGIN_MODAL" });
        }
      } catch (error) {
        console.error("Redirect authentication error:", error);
      }
    };

    handleRedirectResult();
    return unsubscribe;
  }, [state.user]);

  // Login method
  const login = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Check if Firebase is properly configured
      if (!auth) {
        throw new Error("Firebase auth is not initialized");
      }

      const provider = new GoogleAuthProvider();

      // Try popup first, fallback to redirect if blocked
      try {
        await signInWithPopup(auth, provider);
        dispatch({ type: "HIDE_LOGIN_MODAL" });
      } catch (popupError: any) {
        console.warn("Popup blocked or failed, using redirect:", popupError);

        // If popup is blocked, use redirect
        if (
          popupError.code === "auth/popup-blocked" ||
          popupError.code === "auth/popup-closed-by-user" ||
          popupError.message?.includes("popup")
        ) {
          await signInWithRedirect(auth, provider);
          // Note: redirect will reload the page, so no need to hide modal here
          return; // Exit early for redirect
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      // Only reset loading if we're not redirecting
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Logout method
  const logout = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Modal control methods
  const showLoginModal = () => {
    dispatch({ type: "SHOW_LOGIN_MODAL" });
  };

  const hideLoginModal = () => {
    dispatch({ type: "HIDE_LOGIN_MODAL" });
  };

  const value: AuthContextType = {
    state,
    login,
    logout,
    showLoginModal,
    hideLoginModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router";

// Import i18n configuration
import "./i18n";
import { useTranslation } from "react-i18next";

// Import AuthProvider and context
import { AuthProvider, useAuthContext } from "./contexts/AuthContext";
import { LoginModal } from "./components/LoginModal";
import { MigrationPrompt } from "./components/MigrationPrompt";
import { FirebaseStatus } from "./components/FirebaseStatus";

// import page components
import HomePage from "./pages/HomePage";
import UnitDetailPage from "./pages/UnitDetailPage";
import ReviewPage from "./pages/ReviewPage";
import SpellingReviewPage from "./pages/SpellingReviewPage";

// Main app component that uses auth context
function AppContent() {
  const { state, logout, showLoginModal } = useAuthContext();
  const { t } = useTranslation();

  // Show loading spinner while checking auth state
  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 sm:bg-blue-50 md:bg-green-50 lg:bg-purple-50 xl:bg-orange-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header with conditional auth UI */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-xl font-bold text-gray-800">{t("title")}</div>
            {state.user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4">
                  <FirebaseStatus />
                  <div className="text-lg text-gray-700">
                    Welcome, {state.user.displayName || state.user.email}!
                  </div>
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={showLoginModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login
              </button>
            )}
          </div>

          {/* Main content - Always show the app interface */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/unit/:unitId" element={<UnitDetailPage />} />
            <Route path="/review/:unitId" element={<ReviewPage />} />
            <Route
              path="/spelling-review/:unitId"
              element={<SpellingReviewPage />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      {/* Login Modal */}
      {state.showLoginModal && <LoginModal />}

      {/* Migration Prompt */}
      <MigrationPrompt />
    </Router>
  );
}

// Root component that provides auth context
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

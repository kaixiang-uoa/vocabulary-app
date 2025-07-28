import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router';

// Import i18n configuration
import './i18n';

// import page components
import HomePage from './pages/HomePage';
import UnitDetailPage from './pages/UnitDetailPage';
import ReviewPage from './pages/ReviewPage';
import SpellingReviewPage from './pages/SpellingReviewPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/unit/:unitId" element={<UnitDetailPage />} />
            <Route path="/review/:unitId" element={<ReviewPage />} />
            <Route path="/spelling-review/:unitId" element={<SpellingReviewPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

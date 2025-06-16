import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { Home } from './pages/Home';
import { AIAssistant } from './pages/AIAssistant';
import { VirtualTryOn } from './pages/VirtualTryOn';
import { VisualProductSearch } from './pages/VisualProductSearch';
import { SentimentDashboard } from './pages/SentimentDashboard';
import { SmartWishlist } from './pages/SmartWishlist';
import { SustainabilityTracker } from './pages/SustainabilityTracker';
import { VisualOutfitScanner } from './pages/VisualOutfitScanner';

const AppContent: React.FC = () => {
  const location = useLocation();
  const showFooter = location.pathname !== '/ai-assistant';
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/try-on" element={<VirtualTryOn />} />
          <Route path="/visual-search" element={<VisualProductSearch />} />
          <Route path="/sentiment" element={<SentimentDashboard />} />
          <Route path="/wishlist" element={<SmartWishlist />} />
          <Route path="/sustainability" element={<SustainabilityTracker />} />
          <Route path="/outfit-scanner" element={<VisualOutfitScanner />} />
          <Route path="/social" element={<div className="p-8 text-center">Social Hub coming soon...</div>} />
          <Route path="/rewards" element={<div className="p-8 text-center">Rewards coming soon...</div>} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

function App() {
  const { isDarkMode } = useStore();
  
  // Apply theme immediately on mount to prevent flickering
  useEffect(() => {
    // Apply theme class synchronously
    const applyTheme = () => {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    // Apply immediately
    applyTheme();
    
    // Also apply on next frame to ensure it sticks
    requestAnimationFrame(applyTheme);
  }, [isDarkMode]);
  
  // Prevent flash of unstyled content
  useEffect(() => {
    document.documentElement.style.visibility = 'visible';
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
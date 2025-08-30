import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import TracerPanel from './j1/TracerTest';
import DsaVisualizer from './DsaVisualizer'; // 

// ProtectedRoute wrapper
function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/Tracer/*" element={<TracerPanel />} />
        {/* DSA Visualizer protected route */}
        <Route path="/visualizer" element={
          <ProtectedRoute>
            <DsaVisualizer />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;

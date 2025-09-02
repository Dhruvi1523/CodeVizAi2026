import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import HomePage from './pages/HomePage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import TracerPanel from './j1/TracerTest'
import { Home } from 'lucide-react'
import CodePage from './pages/CodePage'

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
  )
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        {/* <Route path="/" element={<ProtectedRoute>
          <HomePage />
        </ProtectedRoute>} /> */}
        <Route path="/" element={<HomePage/>} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/Tracer/*" element={<TracerPanel />} />
        <Route path='/code' element={<CodePage/>} />
      </Routes>
    </Router>
  )
}

export default App

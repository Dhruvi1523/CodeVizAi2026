import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import TracerPanel from "./j1/TracerTest";
import CodePage from "./pages/CodePage";
import ComplexityAnalyzerPage from "./pages/ComplexityAnalyzerPage";
import DSAVisualizerPage from "./pages/DsaVisualizerPage.jsx";
import FlowchartGeneratorPage from "./pages/FlowchartGeneratorPage";
import StackPage from "./pages/dsa/StackPage.jsx";
import QueuePage from "./pages/dsa/QueuePage.jsx";
import LinkedListPage from "./pages/dsa/LinkedListPage.jsx";

// import BstPage from "./pages/dsa/BstPage";
// import AvlTreePage from "./pages/dsa/AvlTreePage";
// import GraphPage from "./pages/dsa/GraphPage";
// import HeapPage from "./pages/dsa/HeapPage";
// import DynamicProgrammingPage from "./pages/dsa/DynamicProgrammingPage";
import DpVisualizationPage from "./components/dp/DpVisualizationPage.jsx";
import DynamicProgramingPage from "./pages/dsa/DynamicProgramingPage.jsx";
// ProtectedRoute wrapper
function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
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
        {/* <Route path="/" element={<ProtectedRoute>
          <HomePage />
        </ProtectedRoute>} /> */}
        <Route path="/" element={<HomePage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/Tracer/*" element={<TracerPanel />} />
        <Route
          path="/flow-chart-generator/*"
          element={<FlowchartGeneratorPage />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route path="/dynamic-programming" element={<DynamicProgramingPage />} />
        <Route path="/dynamic-programming/:algoId" element={<DpVisualizationPage />} />
        <Route path="/code" element={<CodePage />} />
        <Route
          path="/complexity-analyzer"
          element={<ComplexityAnalyzerPage />}
        />
        <Route path="/dsa-visualizer" element={<DSAVisualizerPage />} />
        <Route
          path="/flowchart-generator"
          element={<FlowchartGeneratorPage />}
        />

        <Route path="/stack" element={<StackPage />} />
        <Route path="/queue" element={<QueuePage />} />
        <Route path="/linked-list" element={<LinkedListPage />} />
        {/* <Route path="/bst" element={<BstPage />} />
      <Route path="/avl-tree" element={<AvlTreePage />} />
      <Route path="/graph" element={<GraphPage />} />
      <Route path="/heap" element={<HeapPage />} />
      <Route path="/dynamic-programming" element={<DynamicProgrammingPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;

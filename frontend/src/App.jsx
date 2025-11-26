import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandscapeLayout from "./layouts/LandscapeLayout";

// 📄 Pages
import HomePage from "./pages/HomePage";
import TracerPanel from "./j1/TracerTest";
import CodePage from "./pages/CodePage";
import ComplexityAnalyzerPage from "./pages/ComplexityAnalyzerPage";
import DSAVisualizerPage from "./pages/DsaVisualizerPage.jsx";
import FlowchartGeneratorPage from "./pages/FlowchartGeneratorPage";

// 🧮 DSA Pages
import StackPage from "./pages/dsa/StackPage.jsx";
import QueuePage from "./pages/dsa/QueuePage.jsx";
import LinkedListPage from "./pages/dsa/LinkedListPage.jsx";
import SortingPage from "./pages/dsa/SortingPage.jsx";
import SearchingPage from "./pages/dsa/SearchingPage.jsx";
import TreePage from "./pages/dsa/TreePage.jsx";
import BinarySearchTree from "./pages/dsa/BinarySearchTree.jsx";
import BinaryTree from "./pages/dsa/BinaryTree.jsx";
import AVLTree from "./pages/dsa/AVLTree.jsx";
import RedBlackTree from "./pages/dsa/RedBlackTree.jsx";
import GeneralTree from "./pages/dsa/GeneralTree.jsx";
import BTree from "./pages/dsa/BTree.jsx";
import BPlusTree from "./pages/dsa/BPlusTree.jsx";
import DynamicProgramingPage from "./pages/dsa/DynamicProgramingPage.jsx";

// 📊 DP Components
import DpVisualizationPage from "./components/dp/DpVisualizationPage.jsx";
import LCS from "./components/dynamic-programming/LCS.jsx";

// 🔍 Array Algorithm
import AlgorithmSelector from "./components/Array/AlgorithmSelector.jsx";
import KnapsackInteractivePage from "./components/dynamic-programming/Knapsack.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🏠 Home */}
        <Route path="/" element={<HomePage />} />

        {/* 🧭 Tools */}
        <Route path="/Tracer/*" element={<TracerPanel />} />
        <Route path="/flow-chart-generator/*" element={<FlowchartGeneratorPage />} />
        <Route path="/code" element={<LandscapeLayout><CodePage /></LandscapeLayout>} />
        <Route path="/complexity-analyzer" element={<ComplexityAnalyzerPage />} />

        {/* 🧮 DSA Visualizer */}
        <Route path="/dsa-visualizer" element={<DSAVisualizerPage />} />

        {/* 📊 Dynamic Programming */}
        <Route path="/dynamic-programming" element={<DynamicProgramingPage />} />
        <Route path="/dynamic-programming/:algoId" element={<DpVisualizationPage />} />
        <Route path="/dynamic-programming/lcs" element={<LCS />} />
        {/* <Route path="/dynamic-programming/knapsack" element={<KnapsackInteractivePage/>} /> */}

        {/* 🧱 Data Structures */}
        <Route path="/stack" element={<StackPage />} />
        <Route path="/queue" element={<QueuePage />} />
        <Route path="/linked-list" element={<LinkedListPage />} />

        {/* 🧮 Array Algorithms */}
        <Route path="/array" element={<AlgorithmSelector />} />
        <Route path="/array/sorting/:algoId" element={<SortingPage />} />
        <Route path="/array/searching/:algoId" element={<SearchingPage />} />

        {/* 🌳 Trees */}
        <Route path="/tree-dsa" element={<TreePage />} />
        <Route path="/tree/binary-search-tree" element={<BinarySearchTree />} />
        <Route path="/tree/avl-tree" element={<AVLTree />} />
        <Route path="/tree/red-black-tree" element={<RedBlackTree />} />
        <Route path="/tree/binary-tree" element={<BinaryTree />} />
        <Route path="/tree/general-tree" element={<GeneralTree />} />
        <Route path="/tree/b-tree" element={<BTree />} />
        <Route path="/tree/b-plus-tree" element={<BPlusTree />} />
      </Routes>
    </Router>
  );
}

export default App;

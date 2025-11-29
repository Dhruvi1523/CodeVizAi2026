import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandscapeLayout from "./layouts/LandscapeLayout";

// 📄 Pages
import HomePage from "./pages/HomePage";
import TracerPanel from "./j1/TracerTest";
import CodePage from "./pages/CodePage";
import ComplexityAnalyzerPage from "./pages/ComplexityAnalyzerPage";
import DSAVisualizerPage from "./pages/DsaVisualizerPage.jsx";
import FlowchartGeneratorPage from "./pages/FlowChartGeneratorPage.jsx";

// 🧮 DSA Pages
import StackPage from "./pages/dsa/StackPage.jsx";
        {/*Queue */}
import QueueHome from "./pages/dsa/QueueHome.jsx";
import SimpleQueueVisualizer from "./pages/dsa/SimpleQueueVisualizer";
import CircularQueueVisualizer from "./pages/dsa//CircularQueueVisualizer";
import DequeVisualizer from "./pages/dsa/DequeueVisualizer.jsx";
import PriorityQueueVisualizer from "./pages/dsa/PriorityQueueVisualizer";

import SortingPage from "./pages/dsa/SortingPage.jsx";
import SearchingPage from "./pages/dsa/SearchingPage.jsx";
import TreePage from "./pages/dsa/TreePage.jsx";
import BinarySearchTree from "./pages/dsa/BinarySearchTree.jsx";
import BinaryTree from "./pages/dsa/BinaryTree.jsx";
import AVLTree from "./pages/dsa/AVLTree.jsx";
import RedBlackTree from "./pages/dsa/RedBlackTree.jsx";
import GeneralTree from "./pages/dsa/GeneralTree.jsx";
// import BTree from "./pages/dsa/BTree.jsx";
// import BPlusTree from "./pages/dsa/BPlusTree.jsx";
import DynamicProgramingPage from "./pages/dsa/DynamicProgramingPage.jsx";
import HeapVisualizer from './components/visualizers/HeapVisualizer';
import DFSVisualization from "./pages/dsa/DFSVisualization.jsx";
import BFSVisualization from "./pages/dsa/BFSVisualization.jsx";
import TopologicalSortVisualization from "./pages/dsa/TopologicalSortVisualization.jsx";
import GraphLandingPage from "./pages/dsa/GraphLandingPage.jsx";
import DijkstraVisualization from "./pages/dsa/DijkstraVisualization.jsx";
import ConnectedComponents from "./pages/dsa/ConnectedComponents.jsx";
import HashingPage from "./pages/dsa/HashingHome.jsx"



// Linked List Visualizers
import LinkedListHome from "./pages/dsa/LinkedListHome1.jsx";
import SinglyLinkedListVisualizer from "./pages/dsa/SinglyLinkedListVisualizer.jsx";
import DoublyLinkedListVisualizer from "./pages/dsa/DoublyLinkedListVisualizer.jsx";
import CircularSinglyLinkedListVisualizer from "./pages/dsa/CircularSinglyLinkedListVisualizer.jsx";
import CircularDoublyLinkedListVisualizer from "./pages/dsa/CircularDoublyLinkedListVisualizer.jsx";

// 📊 DP Components
import DpVisualizationPage from "./components/dp/DpVisualizationPage.jsx";
import LCS from "./components/dynamic-programming/LCS.jsx";


// Hashing Visualizers
import SimpleHashing from './pages/dsa/SimpleHashing.jsx';
import SeparateChaining from './pages/dsa/SeparateChaining.jsx';
import LinearProbing from './pages/dsa/LinearProbing.jsx';
import QuadraticProbing from './pages/dsa/QuadraticProbing.jsx';
import DoubleHashing from './pages/dsa/DoubleHashing.jsx';

// 🔍 Array Algorithm
import AlgorithmSelector from "./components/array/AlgorithmSelector.jsx";

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

        {/*Queue */}
        <Route path="/queue" element={<QueueHome />} />
        <Route path="/queue/simple" element={<SimpleQueueVisualizer />} />
        <Route path="/queue/circular" element={<CircularQueueVisualizer />} />
        <Route path="/queue/dequeue" element={<DequeVisualizer/>} />
        <Route path="/queue/priority" element={<PriorityQueueVisualizer />} />
      
         {/*LinkedList */}
        <Route path="/linkedlist" element={<LinkedListHome />} />
        <Route path="/linkedlist/singly" element={<SinglyLinkedListVisualizer />} />
        <Route path="/linkedlist/doubly" element={<DoublyLinkedListVisualizer />} />
        <Route path="/linkedlist/circular-singly" element={<CircularSinglyLinkedListVisualizer />} />
        <Route path="/linkedlist/circular-doubly" element={<CircularDoublyLinkedListVisualizer />} />

        <Route path="/heap" element={<HeapVisualizer />} />

        {/*Hashing */}
        <Route path="/hashing" element={<HashingPage />} />
        <Route path="/hashing/simple" element={<SimpleHashing />} />
        <Route path="/hashing/chaining" element={<SeparateChaining />} />
        <Route path="/hashing/linear-probing" element={<LinearProbing />} />
        <Route path="/hashing/quadratic-probing" element={<QuadraticProbing />} />        
        <Route path="/hashing/double-hashing" element={<DoubleHashing />} />

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
        {/* <Route path="/tree/b-tree" element={<BTree />} />
        <Route path="/tree/b-plus-tree" element={<BPlusTree />} /> */}

        {/* 🌐 Graphs */}
        <Route path="/graph-dsa" element={<GraphLandingPage />} />
        <Route path="/graph/dfs" element={<DFSVisualization />} />
        <Route path="/graph/bfs" element={<BFSVisualization />} />
        <Route path="/graph/topological-sort" element={<TopologicalSortVisualization />} />
        <Route path="/graph/dijkstra" element={<DijkstraVisualization />} />
        <Route path="/graph/ConnectedComponents" element={<ConnectedComponents />} />
        {/* Additional graph routes can be added here */} 
      </Routes>
    </Router>
  );
}

export default App;

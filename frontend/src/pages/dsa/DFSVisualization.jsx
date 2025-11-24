import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";

function DFSVisualization() {
  const [graphType, setGraphType] = useState("directed"); // 'directed' or 'undirected'
  const [nodes, setNodes] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [edges, setEdges] = useState([
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [3, 6]
  ]);
  const [startVertex, setStartVertex] = useState(0);
  const [newNodeId, setNewNodeId] = useState(7);
  const [fromNode, setFromNode] = useState(0);
  const [toNode, setToNode] = useState(1);

  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);

  const nodePositions = useRef({});

  // Auto circular layout
  const updateNodePositions = () => {
    const radius = 200;
    const centerX = 300;
    const centerY = 250;

    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
      nodePositions.current[node] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    if (nodes.includes(startVertex)) {
      nodePositions.current[startVertex] = { x: centerX, y: 70 };
    }
  };

  useEffect(() => {
    updateNodePositions();
  }, [nodes, startVertex]);

  const buildAdjList = () => {
    const adj = {};
    nodes.forEach(n => adj[n] = []);
    edges.forEach(([u, v]) => {
      adj[u].push(v);
      if (graphType === "undirected") adj[v].push(u);
    });
    return adj;
  };

  const runDFS = () => {
    setIsPlaying(false);
    setCurrentStep(-1);

    const adj = buildAdjList();
    const visited = {};
    const parent = {};
    const stack = [];
    const newSteps = [];

    nodes.forEach(n => { visited[n] = false; parent[n] = null; });

    stack.push(startVertex);
    visited[startVertex] = true;
    parent[startVertex] = -1;

    newSteps.push({ stack: [...stack], visited: { ...visited }, parent: { ...parent }, current: null, description: `Starting DFS from node ${startVertex}` });

    while (stack.length > 0) {
      const u = stack.pop();

      newSteps.push({ stack: [...stack], visited: { ...visited }, parent: { ...parent }, current: u, description: `Exploring node ${u}` });

      (adj[u] || []).reverse().forEach(v => {
        if (!visited[v]) {
          stack.push(v);
          visited[v] = true;
          parent[v] = u;
          newSteps.push({ stack: [...stack], visited: { ...visited }, parent: { ...parent }, current: u, description: `Discovered ${v} → pushed to stack` });
        }
      });
    }

    newSteps.push({ stack: [], visited: { ...visited }, parent: { ...parent }, current: null, description: "DFS Completed!" });
    setSteps(newSteps);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => setCurrentStep(prev => prev + 1), speed);
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps.length, speed]);

  const currentState = steps[currentStep] || {
    stack: [],
    visited: Object.fromEntries(nodes.map(n => [n, false])),
    parent: Object.fromEntries(nodes.map(n => [n, null])),
    current: null,
    description: "Click 'Run DFS' to begin visualization",
  };

  const addNode = () => {
    if (!nodes.includes(newNodeId)) {
      setNodes(prev => [...prev, newNodeId]);
      setNewNodeId(prev => prev + 1);
    }
  };

  const removeNode = (node) => {
    setNodes(prev => prev.filter(n => n !== node));
    setEdges(prev => prev.filter(([u, v]) => u !== node && v !== node));
    if (startVertex === node && nodes.length > 1) setStartVertex(nodes.find(n => n !== node));
  };

  const addEdge = () => {
    const exists = edges.some(([u, v]) => u === fromNode && v === toNode);
    if (!exists && nodes.includes(fromNode) && nodes.includes(toNode)) {
      setEdges(prev => [...prev, [fromNode, toNode]]);
    }
  };

  const removeEdge = (u, v) => {
    setEdges(prev => prev.filter(([a, b]) => !(a === u && b === v)));
  };

  const drawGraph = () => {
    return (
      <svg className="w-full h-[520px] bg-gray-900 rounded-xl shadow-2xl" viewBox="0 0 600 520">
        {/* Directed Arrow Marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="12"
            markerHeight="12"
            refX="26"
            refY="6"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,12 L18,6 z" fill="#60a5fa" />
          </marker>
          <marker
            id="arrowhead-active"
            markerWidth="12"
            markerHeight="12"
            refX="19"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,12 L18,6 z" fill="#f472b6" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map(([u, v], i) => {
          const pu = nodePositions.current[u] || { x: 300, y: 250 };
          const pv = nodePositions.current[v] || { x: 300, y: 250 };

          const isTreeEdge = currentState.parent[v] === u || (graphType === "undirected" && currentState.parent[u] === v);
          const isVisitedBoth = currentState.visited[u] && currentState.visited[v];

          const strokeColor = isTreeEdge ? "#60a5fa" : isVisitedBoth ? "#6ee7b7" : "#4b5563";
          const strokeWidth = isTreeEdge ? 4 : 2;
          const marker = isTreeEdge ? "url(#arrowhead-active)" : "url(#arrowhead)";

          if (graphType === "undirected") {
            return (
              <line
                key={i}
                x1={pu.x} y1={pu.y}
                x2={pv.x} y2={pv.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                opacity={isVisitedBoth || isTreeEdge ? 1 : 0.5}
              />
            );
          }

          // Directed edge with arrow
          return (
            <line
              key={i}
              x1={pu.x} y1={pu.y}
              x2={pv.x} y2={pv.y}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              markerEnd={graphType === "directed" ? marker : ""}
              opacity={isVisitedBoth || isTreeEdge ? 1 : 0.6}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(n => {
          const pos = nodePositions.current[n] || { x: 300, y: 250 };
          const isCurrent = currentState.current === n;
          const isVisited = currentState.visited[n];

          return (
            <g key={n}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="32"
                fill={isCurrent ? "#f472b6" : isVisited ? "#34d399" : "#1f2937"}
                stroke={isCurrent ? "#ec4899" : isVisited ? "#10b981" : "#6b7280"}
                strokeWidth={isCurrent ? 6 : 4}
                className="transition-all duration-300"
              />
              <text
                x={pos.x}
                y={pos.y + 8}
                textAnchor="middle"
                fontSize="20"
                fontWeight="bold"
                fill="white"
              >
                {n}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="w-full bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
         
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-blue-400">
            Depth-First Search (DFS) Visualization
          </h1>
          <div className="absolute left-6"> 
            <Link
  to="/graph-dsa"
  className="group flex items-center gap-3 px-7 py-4 bg-white/10 hover:bg-white/20 
             backdrop-blur-md border border-white/20 rounded-2xl font-bold text-lg
             transition-all duration-300 hover:scale-105 hover:shadow-2xl
             hover:border-white/40"
>
  {/* Left Arrow Icon using pure Tailwind + SVG */}
  <svg
    className="w-6 h-6 text-cyan-400 group-hover:-translate-x-1 transition-transform duration-300"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M15 19l-7-7 7-7"
    />
  </svg>

  {/* Text with nice gradient 
  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-pink-400 
                   bg-clip-text text-transparent">
    left most side
  </span> */}
</Link>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10">
        {/* Controls Panel */}
        <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl shadow-2xl p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-pink-400 mb-4">Graph Settings</h3>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-300">Type:</span>
                  <select
                    value={graphType}
                    onChange={(e) => setGraphType(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="directed">Directed →</option>
                    <option value="undirected">Undirected ↔</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-300">Start Node:</span>
                  <select
                    value={startVertex}
                    onChange={(e) => setStartVertex(Number(e.target.value))}
                    className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3"
                  >
                    {nodes.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">Add Elements</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={newNodeId}
                    onChange={(e) => setNewNodeId(Number(e.target.value))}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 w-24 text-white"
                  />
                  <button onClick={addNode} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-5 py-3 rounded-lg font-bold transition">
                    Add Node
                  </button>
                </div>

                <div className="flex gap-2 items-center">
                  <select value={fromNode} onChange={(e) => setFromNode(Number(e.target.value))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-3">
                    {nodes.map(n => <option key={n}>{n}</option>)}
                  </select>
                  <span className="text-2xl text-pink-400">→</span>
                  <select value={toNode} onChange={(e) => setToNode(Number(e.target.value))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-3">
                    {nodes.map(n => <option key={n}>{n}</option>)}
                  </select>
                  <button onClick={addEdge} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-5 py-3 rounded-lg font-bold transition">
                    Add Edge
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Current Graph</h3>
              <div className="text-sm space-y-2">
                <p><strong className="text-pink-400">Nodes:</strong> {nodes.join(", ")}</p>
                <p><strong className="text-cyan-400">Edges:</strong> {edges.map(([u, v]) => `${u}→${v}`).join(", ")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Run Button */}
        <div className="text-center mb-10">
          <button
            onClick={runDFS}
            className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 text-white text-2xl font-bold px-16 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition duration-300"
          >
            Run DFS Visualization
          </button>
        </div>

        {/* Main Visualization */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-gray-900/90 backdrop-blur border border-gray-800 rounded-2xl shadow-2xl p-6">
              <h3 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
                Graph Visualization
              </h3>
              <div className="flex justify-center">
                {drawGraph()}
              </div>
            </div>

            {/* Description */}
            <div className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur border border-purple-700 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-pink-300 mb-3">Current Action:</h3>
              <p className="text-xl text-gray-100 leading-relaxed">{currentState.description}</p>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">DFS Stack (Top → Bottom)</h3>
              <div className="bg-black/40 rounded-lg p-4 font-mono text-lg min-h-[150px] border border-gray-700">
                {currentState.stack.length > 0 ? (
                  currentState.stack.slice().reverse().map((n, i) => (
                    <div key={i} className={`py-2 ${i === 0 ? "text-pink-400 font-bold" : "text-gray-300"}`}>
                      {n} {i === 0 && "← top"}
                    </div>
                  ))
                ) : (
                  <span className="text-gray-600">Stack is empty</span>
                )}
              </div>
            </div>

            <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-green-400 mb-4">Parent Table</h3>
              <table className="w-full text-sm">
                {nodes.map(n => (
                  <tr key={n} className="border-b border-gray-800">
                    <td className="py-3 font-mono text-cyan-400">{n}</td>
                    <td className="py-3 text-right font-mono text-gray-300">
                      {currentState.parent[n] === -1 ? "root" : currentState.parent[n] ?? "—"}
                    </td>
                  </tr>
                ))}
              </table>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        {steps.length > 0 && (
          <div className="mt-12 bg-gray-900/90 backdrop-blur border border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-wrap items-center justify-center gap-6">
            <button onClick={() => setCurrentStep(0)} className="bg-gray-700 hover:bg-gray-600 px-6 py-4 rounded-xl font-bold">⏮ First</button>
            <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} className="bg-gray-700 hover:bg-gray-600 px-6 py-4 rounded-xl font-bold">Prev</button>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-12 py-5 rounded-xl font-bold text-xl transition ${isPlaying ? "bg-red-600 hover:bg-red-700" : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"}`}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>

            <button onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))} className="bg-gray-700 hover:bg-gray-600 px-6 py-4 rounded-xl font-bold">Next</button>
            <button onClick={() => setCurrentStep(steps.length - 1)} className="bg-gray-700 hover:bg-gray-600 px-6 py-4 rounded-xl font-bold">Last</button>

            <div className="flex items-center gap-4">
              <span className="text-gray-400">Speed:</span>
              <input
                type="range"
                min="100"
                max="3000"
                step="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-48 accent-pink-500"
              />
              <span className="text-sm text-gray-400 w-20">{speed}ms</span>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default DFSVisualization;
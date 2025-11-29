// ConnectedComponents.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const ConnectedComponents = () => {
  const [nodes, setNodes] = useState([0, 1, 2, 3, 4]);
  const [edges, setEdges] = useState([
    // Component 1: 0, 1, 2 fully connected
    [0, 1], [1, 2], [2, 0],
    // Component 2: 3, 4 connected
    [3, 4]
  ]);

  const [fromNode, setFromNode] = useState(0);
  const [toNode, setToNode] = useState(1);
  const [newNodeId, setNewNodeId] = useState(5);

  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Compute positions in a perfect circle
  const getPositions = () => {
    const positions = {};
    const radius = isMobile ? 120 : 180;
    const cx = isMobile ? 200 : 300;
    const cy = isMobile ? 200 : 250;
    
    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
      positions[node] = {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
      };
    });
    return positions;
  };

  const positions = getPositions();

  // Run DFS to find connected components - ENHANCED VERSION
  const findConnectedComponents = () => {
    setCurrentStep(-1);
    setIsPlaying(false);

    const visited = {};
    const componentOf = {};
    let compId = 0;
    const newSteps = [];

    // Initialize visited array
    nodes.forEach(n => {
      visited[n] = false;
      componentOf[n] = -1; // -1 means not assigned to any component yet
    });

    // Helper function to add step
    const addStep = (node = null, description = "") => {
      newSteps.push({
        visited: { ...visited },
        componentOf: { ...componentOf },
        current: node,
        desc: description
      });
    };

    // Add initial state
    addStep(null, "Starting DFS traversal to find connected components...");

    const dfs = (node, id) => {
      visited[node] = true;
      componentOf[node] = id;

      addStep(node, `Visiting node ${node} → assigned to Component ${id + 1}`);

      // Check neighbors in both directions (undirected graph)
      edges.forEach(([a, b]) => {
        if (a === node && !visited[b]) {
          addStep(null, `Found neighbor ${b} of ${node}, will visit next`);
          dfs(b, id);
        }
        if (b === node && !visited[a]) {
          addStep(null, `Found neighbor ${a} of ${node}, will visit next`);
          dfs(a, id);
        }
      });
    };

    // Start DFS from each unvisited node
    nodes.forEach(node => {
      if (!visited[node]) {
        addStep(node, `Starting new component ${compId + 1} from node ${node}`);
        dfs(node, compId);
        compId++;
      }
    });

    // Final step
    const componentCount = compId;
    const components = {};
    nodes.forEach(n => {
      const id = componentOf[n];
      if (!components[id]) components[id] = [];
      components[id].push(n);
    });

    const componentDescriptions = Object.keys(components).map(id => 
      `Component ${Number(id) + 1}: {${components[id].sort((a,b) => a-b).join(', ')}}`
    );

    addStep(null, `✅ Complete! Found ${componentCount} connected component${componentCount !== 1 ? 's' : ''}:
    ${componentDescriptions.join('\n    ')}`);

    setSteps(newSteps);
    setCurrentStep(0);
  };

  // Auto-play
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => setCurrentStep(i => i + 1), speed);
      return () => clearTimeout(timer);
    }
    if (currentStep >= steps.length - 1) setIsPlaying(false);
  }, [isPlaying, currentStep, steps.length, speed]);

  const state = steps[currentStep] || {
    visited: Object.fromEntries(nodes.map(n => [n, false])),
    componentOf: Object.fromEntries(nodes.map(n => [n, -1])),
    current: null,
    desc: "Click 'Find Connected Components' to start!\n\nExample: Nodes 0,1,2 form one component (fully connected)\nNodes 3,4 form another component (connected to each other but not to 0,1,2)"
  };

  const finalState = steps.length > 0 ? steps[steps.length - 1] : null;

  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

  const getNodeColor = (node) => {
    if (currentStep === -1) {
      // Initial state - gray nodes
      return "#6b7280";
    }
    
    if (!finalState || currentStep < steps.length - 1) {
      // During animation
      return state.visited[node] ? 
        (state.current === node ? "#ec4899" : "#10b981") : // green for visited, pink for current
        "#6b7280"; // gray for unvisited
    }
    
    // Final state - color by component
    const id = finalState.componentOf[node];
    if (id === -1) return "#6b7280"; // Shouldn't happen
    return colors[id % colors.length];
  };

  const addNode = () => {
    if (!nodes.includes(newNodeId)) {
      setNodes(prev => [...prev, newNodeId]);
      setNewNodeId(prev => prev + 1);
      // Update positions when nodes change
    }
  };

  const addEdge = () => {
    if (fromNode === toNode) {
      alert("Cannot create self-loop!");
      return;
    }
    
    // Check if edge already exists (undirected)
    const exists = edges.some(([a, b]) => 
      (a === fromNode && b === toNode) || (a === toNode && b === fromNode)
    );
    
    if (!exists) {
      setEdges(prev => [...prev, [Math.min(fromNode, toNode), Math.max(fromNode, toNode)]]);
    } else {
      alert("Edge already exists!");
    }
  };

  const clearGraph = () => {
    // Reset to no edges (each node is its own component)
    setEdges([]);
  };

  const loadExample = () => {
    // Your exact example
    setNodes([0, 1, 2, 3, 4]);
    setEdges([
      [0, 1], [1, 2], [2, 0],  // Component 1: 0,1,2 fully connected
      [3, 4]                    // Component 2: 3,4 connected
    ]);
    setNewNodeId(5);
  };

  const loadEmptyExample = () => {
    // No edges - each node is its own component
    setNodes([0, 1, 2, 3, 4]);
    setEdges([]);
    setNewNodeId(5);
  };

  const finalComponents = () => {
    if (!finalState) return [];
    
    const map = {};
    nodes.forEach(n => {
      const id = finalState.componentOf[n];
      if (id !== -1 && !map[id]) map[id] = [];
      if (id !== -1) map[id].push(n);
    });
    
    return Object.keys(map)
      .map(id => ({
        id: Number(id),
        nodes: map[id].sort((a, b) => a - b),
        color: colors[Number(id) % colors.length]
      }))
      .sort((a, b) => a.id - b.id);
  };

  const nodeRadius = isMobile ? 20 : 28;
  const svgWidth = isMobile ? 400 : 600;
  const svgHeight = isMobile ? 400 : 520;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <Navbar />

      <div className="w-full bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 flex items-center justify-center relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-2 sm:left-4 flex items-center gap-2 px-2 sm:px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg border border-gray-600 transition text-xs sm:text-sm"
          >
            <span>←</span>
            <span>Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-lg sm:text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-pink-400">
              Connected Components
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Find all connected components in a graph</p>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-2 sm:px-6 py-4 sm:py-10">
        {/* Controls */}
        <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-lg sm:rounded-2xl shadow-2xl p-3 sm:p-6 mb-4 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div>
              <h3 className="text-xs sm:text-lg font-bold text-pink-400 mb-2">Add Node</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newNodeId}
                  onChange={(e) => setNewNodeId(Number(e.target.value))}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 sm:px-3 py-2 text-white text-xs sm:text-sm"
                />
                <button onClick={addNode} className="bg-cyan-600 hover:bg-cyan-500 px-2 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition">
                  Add
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xs sm:text-lg font-bold text-cyan-400 mb-2">Add Edge</h3>
              <div className="flex gap-1 sm:gap-2">
                <select value={fromNode} onChange={(e) => setFromNode(Number(e.target.value))}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-white text-xs sm:text-sm">
                  {nodes.map(n => <option key={n}>{n}</option>)}
                </select>
                <span className="text-pink-400 text-lg">↔</span>
                <select value={toNode} onChange={(e) => setToNode(Number(e.target.value))}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-white text-xs sm:text-sm">
                  {nodes.map(n => <option key={n}>{n}</option>)}
                </select>
                <button onClick={addEdge} className="bg-purple-600 hover:bg-purple-500 px-2 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition">
                  Add
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={loadExample} className="bg-green-600 hover:bg-green-500 px-3 py-2 rounded-lg font-bold text-xs sm:text-sm transition">
                Example
              </button>
              <button onClick={loadEmptyExample} className="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-lg font-bold text-xs sm:text-sm transition">
                Empty
              </button>
              <button onClick={clearGraph} className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded-lg font-bold text-xs sm:text-sm transition">
                Clear
              </button>
            </div>

            <div className="text-xs sm:text-sm space-y-1">
              <p><strong className="text-pink-400">Nodes:</strong> {nodes.length}</p>
              <p><strong className="text-cyan-400">Edges:</strong> {edges.length}</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-4 sm:mb-8">
          <button onClick={findConnectedComponents}
            className="bg-gradient-to-r from-pink-600 to-blue-600 hover:from-pink-500 hover:to-blue-500 text-white text-sm sm:text-lg md:text-xl font-bold px-4 sm:px-12 py-3 sm:py-6 rounded-lg sm:rounded-2xl shadow-2xl transform hover:scale-105 transition">
            Find Components
          </button>
        </div>

        {/* Visualization Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">
            {/* Graph */}
            <div className="bg-gray-900/90 backdrop-blur border border-gray-800 rounded-lg sm:rounded-2xl shadow-2xl p-3 sm:p-6">
              <h3 className="text-base sm:text-2xl font-bold text-center mb-3 sm:mb-6 text-amber-400">Graph</h3>
              <div className="w-full flex justify-center" ref={containerRef}>
                <svg width="100%" height="auto" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="bg-gray-950 rounded-lg" style={{ maxWidth: "100%" }}>
                  {/* Edges */}
                  {edges.map(([u, v], i) => {
                    const p1 = positions[u];
                    const p2 = positions[v];
                    const isActiveEdge = state.current === u || state.current === v ||
                      (state.visited[u] && state.visited[v] && finalState?.componentOf[u] === finalState?.componentOf[v]);
                    
                    return (
                      <line
                        key={`edge-${i}`}
                        x1={p1.x} y1={p1.y}
                        x2={p2.x} y2={p2.y}
                        stroke={isActiveEdge ? getNodeColor(u) : "#64748b"}
                        strokeWidth={isActiveEdge ? 5 : 2}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    );
                  })}

                  {/* Nodes */}
                  {nodes.map(node => {
                    const pos = positions[node];
                    const isCurrent = state.current === node;
                    const isVisited = state.visited[node];
                    
                    return (
                      <g key={node}>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={nodeRadius}
                          fill={isCurrent ? "#ec4899" : getNodeColor(node)}
                          stroke={isCurrent ? "#f472b6" : "#374151"}
                          strokeWidth={isCurrent || isVisited ? 4 : 2}
                          className="transition-all duration-500 cursor-pointer hover:scale-110"
                        />
                        <text 
                          x={pos.x} 
                          y={pos.y + 6} 
                          textAnchor="middle" 
                          fontSize={isMobile ? "14" : "18"} 
                          fontWeight="bold" 
                          fill="white"
                          className="transition-all duration-500 pointer-events-none"
                        >
                          {node}
                        </text>
                      </g>
                    );
                  })}

                  {/* Component Labels */}
                  {finalState && currentStep === steps.length - 1 && finalComponents().map(comp => {
                    if (comp.nodes.length === 1) return null;
                    const centerX = comp.nodes.reduce((sum, n) => sum + positions[n].x, 0) / comp.nodes.length;
                    const centerY = comp.nodes.reduce((sum, n) => sum + positions[n].y, 0) / comp.nodes.length;
                    
                    return (
                      <g key={`comp-${comp.id}`}>
                        <circle
                          cx={centerX}
                          cy={centerY}
                          r={comp.nodes.length * 8}
                          fill="none"
                          stroke={comp.color}
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          opacity="0.7"
                        />
                        <text 
                          x={centerX} 
                          y={centerY - 25} 
                          textAnchor="middle" 
                          fontSize={isMobile ? "12" : "16"} 
                          fontWeight="bold" 
                          fill={comp.color}
                        >
                          C{comp.id + 1}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur border border-purple-700 rounded-lg sm:rounded-2xl p-3 sm:p-6 shadow-2xl">
              <h3 className="text-sm sm:text-xl font-bold text-pink-300 mb-2 sm:mb-3">Step Info</h3>
              <p className="text-xs sm:text-base text-gray-100 whitespace-pre-line leading-relaxed">{state.desc}</p>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4 sm:space-y-6">
            {/* Final Result */}
            {finalState && currentStep === steps.length - 1 && (
              <div className="bg-gray-900/90 backdrop-blur border border-amber-600/60 rounded-lg sm:rounded-2xl p-3 sm:p-6 shadow-2xl">
                <h3 className="text-base sm:text-2xl font-bold text-center mb-4 bg-gradient-to-r from-amber-400 to-pink-400 bg-clip-text text-transparent">
                  Components Found!
                </h3>
                <div className="space-y-3">
                  {finalComponents().map(c => (
                    <div key={c.id} className="p-3 sm:p-4 rounded-lg border-2 text-xs sm:text-sm" 
                         style={{ 
                           backgroundColor: c.color + "20", 
                           borderColor: c.color,
                         }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-white">
                          Component {c.id + 1}
                        </span>
                        <span className="text-xs text-gray-300">{c.nodes.length} nodes</span>
                      </div>
                      <div className="font-mono bg-black/40 rounded p-2 text-xs break-all">
                        {c.nodes.join(" ↔ ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur border border-purple-700 rounded-lg sm:rounded-2xl p-3 sm:p-6">
              <h4 className="text-sm sm:text-lg font-bold text-yellow-400 mb-2 sm:mb-3">Legend</h4>
              <div className="space-y-2 text-xs sm:text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                  <span>Unvisited</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Visited</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  <span>Current</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        {steps.length > 0 && (
          <div className="mt-6 sm:mt-12 bg-gray-900/90 backdrop-blur border border-gray-800 rounded-lg sm:rounded-2xl p-3 sm:p-6 shadow-2xl">
            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
              <button onClick={() => setCurrentStep(0)} className="bg-gray-700 hover:bg-gray-600 px-2 sm:px-4 py-2 rounded text-xs sm:text-sm font-bold transition">⏮ First</button>
              <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} className="bg-gray-700 hover:bg-gray-600 px-2 sm:px-4 py-2 rounded text-xs sm:text-sm font-bold transition">⏪ Prev</button>
              
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-4 sm:px-8 py-2 rounded font-bold text-xs sm:text-sm transition ${
                  isPlaying ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-500"
                }`}
              >
                {isPlaying ? "⏸ Pause" : "▶ Play"}
              </button>

              <button onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))} className="bg-gray-700 hover:bg-gray-600 px-2 sm:px-4 py-2 rounded text-xs sm:text-sm font-bold transition">⏩ Next</button>
              <button onClick={() => setCurrentStep(steps.length - 1)} className="bg-gray-700 hover:bg-gray-600 px-2 sm:px-4 py-2 rounded text-xs sm:text-sm font-bold transition">⏭ Last</button>

              <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <label className="text-xs text-gray-400">Speed:</label>
                <input type="range" min="300" max="2500" step="100" value={speed} onChange={(e) => setSpeed(+e.target.value)} className="w-20 sm:w-32 accent-pink-500" />
                <span className="text-xs text-gray-400 whitespace-nowrap">{speed}ms</span>
              </div>

              <div className="text-xs text-gray-400 w-full sm:w-auto text-center sm:ml-auto">
                Step {currentStep + 1} / {steps.length}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ConnectedComponents;
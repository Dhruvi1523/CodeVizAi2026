// ConnectedComponents.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";

const ConnectedComponents = () => {
  // Initialize with your example: nodes 0-4, components {0,1,2} and {3,4}
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

  // Compute positions in a perfect circle
  const getPositions = () => {
    const positions = {};
    const radius = 220;
    const cx = 350;
    const cy = 270;
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

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <Navbar />

      <div className="w-full bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-pink-400">
            Connected Components
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

        {/* Controls */}
        <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-pink-400 mb-4">Add Node</h3>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={newNodeId}
                  onChange={(e) => setNewNodeId(Number(e.target.value))}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 w-28 text-white"
                />
                <button onClick={addNode} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-6 py-3 rounded-lg font-bold">
                  Add Node
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">Add Edge</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <select 
                  value={fromNode} 
                  onChange={(e) => setFromNode(Number(e.target.value))} 
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                >
                  {nodes.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-3xl text-pink-400">↔</span>
                <select 
                  value={toNode} 
                  onChange={(e) => setToNode(Number(e.target.value))} 
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                >
                  {nodes.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <button 
                  onClick={addEdge} 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-6 py-3 rounded-lg font-bold"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={loadExample}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-4 py-3 rounded-lg font-bold text-sm"
              >
                Example Graph
              </button>
              <button
                onClick={loadEmptyExample}
                className="bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 px-4 py-3 rounded-lg font-bold text-sm"
              >
                Empty Graph
              </button>
              <button
                onClick={clearGraph}
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 px-4 py-3 rounded-lg font-bold text-sm"
              >
                Clear Edges
              </button>
            </div>

            <div className="text-sm space-y-1 self-end">
              <p><strong className="text-pink-400">Nodes:</strong> {nodes.length} ({nodes.join(", ")})</p>
              <p><strong className="text-cyan-400">Edges:</strong> {edges.length}</p>
              {edges.length > 0 && (
                <p className="text-xs text-gray-400 truncate">
                  {edges.map(([a,b]) => `${a}↔${b}`).join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mb-10">
          <button
            onClick={findConnectedComponents}
            className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 text-white text-2xl font-bold px-16 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition duration-300"
           >
            Find Connected Components
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            {/* Graph */}
            <div className="bg-gray-900/90 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-amber-400 to-pink-400 bg-clip-text text-transparent">
                Graph Visualization
              </h3>
              <div className="relative">
                <svg width="100%" height="560" viewBox="0 0 700 560" className="bg-gray-900 rounded-xl">
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
                          r="42"
                          fill={isCurrent ? "#ec4899" : getNodeColor(node)}
                          stroke={isCurrent ? "#f472b6" : "#374151"}
                          strokeWidth={isCurrent || isVisited ? 6 : 3}
                          className="transition-all duration-500 cursor-pointer hover:scale-110"
                          onClick={() => {
                            if (currentStep === -1) {
                              setFromNode(node);
                              setToNode(node);
                            }
                          }}
                        />
                        <text 
                          x={pos.x} 
                          y={pos.y + 8} 
                          textAnchor="middle" 
                          fontSize="24" 
                          fontWeight="bold" 
                          fill="white"
                          className="transition-all duration-500"
                        >
                          {node}
                        </text>
                        {currentStep === -1 && (
                          <text 
                            x={pos.x} 
                            y={pos.y + 35} 
                            textAnchor="middle" 
                            fontSize="12" 
                            fill="#9ca3af"
                            className="pointer-events-none"
                          >
                            Click to select
                          </text>
                        )}
                      </g>
                    );
                  })}
                  
                  {/* Component labels in final state */}
                  {finalState && currentStep === steps.length - 1 && finalComponents().map(comp => {
                    if (comp.nodes.length === 1) return null;
                    
                    // Find center of component
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
                          fontSize="16" 
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

            <div className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur border border-purple-700 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-pink-300 mb-3">Algorithm Step</h3>
              <div className="text-lg text-gray-100 whitespace-pre-line leading-relaxed">
                {state.desc}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Final Result */}
            {finalState && currentStep === steps.length - 1 && (
              <div className="bg-gray-900/90 backdrop-blur border border-amber-600/60 rounded-2xl p-8 shadow-2xl">
                <h3 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-amber-400 to-pink-400 bg-clip-text text-transparent">
                   Connected Components Found!
                </h3>
                <div className="space-y-4">
                  {finalComponents().map(c => (
                    <div key={c.id} className="p-4 rounded-xl border-2 shadow-lg" 
                         style={{ 
                           backgroundColor: c.color + "20", 
                           borderColor: c.color,
                           boxShadow: `0 0 20px ${c.color}20`
                         }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-bold text-white">
                          Component {c.id + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{backgroundColor: c.color}}></div>
                          <span className="text-sm text-gray-300">{c.nodes.length} node{c.nodes.length > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="font-mono text-xl bg-black/20 rounded p-2">
                        {c.nodes.join(" ↔ ")}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Verification message */}
                <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-300">
                     <strong>Verification:</strong> Each component is fully connected internally, 
                    and no edges exist between different components.
                  </p>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur border border-purple-700 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-yellow-400 mb-4">Legend</h4>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                  <span>Unvisited node</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>Visited node</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-pink-500 rounded-full"></div>
                  <span>Current node (DFS)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 border-2 border-amber-400 rounded-full"></span>
                  <span>Component boundary</span>
                </div>
              </div>
            </div>

            {/* Quick Examples */}
            <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-xl p-4">
              <h4 className="text-lg font-bold text-cyan-400 mb-3">Quick Examples</h4>
              <div className="text-sm space-y-2 text-gray-300">
                <div className="text-sm space-y-2 text-gray-300">
  <p>
    <strong>Your Example:</strong> {'{0, 1, 2}'} ↔ {'{3, 4}'} →{' '}
    <span className="text-green-400">2 components</span>
  </p>
  <p>
    <strong>No edges:</strong> {'{0}, {1}, {2}, {3}, {4}'} →{' '}
    <span className="text-green-400">5 components</span>
  </p>
  <p>
    <strong>Fully connected:</strong> All nodes connected →{' '}
    <span className="text-green-400">1 component</span>
  </p>
</div>
                <p><strong>No edges:</strong> {0},{1},{2},{3},{4} → <span className="text-green-400">5 components</span></p>
                <p><strong>Fully connected:</strong> All nodes ↔ → <span className="text-green-400">1 component</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        {steps.length > 0 && (
          <div className="mt-12 bg-gray-900/90 backdrop-blur border border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-wrap justify-center items-center gap-6">
            <button 
              onClick={() => setCurrentStep(0)} 
              className="bg-gray-700 hover:bg-gray-600 px-6 py-4 rounded-xl font-bold transition-colors"
              title="First step"
            >
              ⏮️ First
            </button>
            <button 
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} 
              className="bg-gray-700 hover:bg-gray-600 px-6 py-4 rounded-xl font-bold transition-colors"
              title="Previous step"
            >
              ⏪ Prev
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className={`px-12 py-5 rounded-xl font-bold text-xl transition-all ${
                isPlaying 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
              }`}
              title={isPlaying ? "Pause animation" : "Play animation"}
            >
              {isPlaying ? "⏸️ Pause" : "▶️ Play"}
            </button>
            <button 
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))} 
              className="bg-gray-700 hover:bg-gray-600 px-6 py-4 rounded-xl font-bold transition-colors"
              title="Next step"
            >
              ⏩ Next
            </button>
            <button 
              onClick={() => setCurrentStep(steps.length - 1)} 
              className="bg-gray-700 hover:bg-gray-600 px-6 py-4 rounded-xl font-bold transition-colors"
              title="Last step"
            >
              ⏭️ Last
            </button>
            
            <div className="flex items-center gap-4 ml-8">
              <span className="text-gray-400">Speed:</span>
              <input 
                type="range" 
                min="300" 
                max="2500" 
                step="100" 
                value={speed} 
                onChange={(e) => setSpeed(+e.target.value)} 
                className="w-48 accent-pink-500" 
              />
              <span className="text-sm text-gray-400">{speed}ms</span>
            </div>
            
            <div className="ml-auto text-sm text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ConnectedComponents;
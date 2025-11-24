import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";

function DijkstraVisualization() {
  const [nodes, setNodes] = useState([0, 1, 2, 3, 4, 5]);
  const [edges, setEdges] = useState([
    [0, 1, 4], [0, 2, 2], [1, 2, 1], [1, 3, 5],
    [2, 3, 8], [2, 4, 10], [3, 4, 2], [3, 5, 6], [4, 5, 3]
  ]);
  const [startVertex, setStartVertex] = useState(0);
  const [newNodeId, setNewNodeId] = useState(6);
  const [fromNode, setFromNode] = useState(0);
  const [toNode, setToNode] = useState(1);
  const [weight, setWeight] = useState(5);

  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200);

  const nodePositions = useRef({});

  const updateNodePositions = () => {
    const radius = 200;
    const centerX = 300;
    const centerY = 250;

    const uniqueNodes = [...new Set(nodes)];
    uniqueNodes.forEach((node, i) => {
      const angle = (i / uniqueNodes.length) * 2 * Math.PI - Math.PI / 2;
      nodePositions.current[node] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    if (nodes.includes(startVertex)) {
      nodePositions.current[startVertex] = { x: centerX, y: 80 };
    }
  };

  useEffect(() => {
    updateNodePositions();
  }, [nodes, startVertex]);

  const runDijkstra = () => {
    setIsPlaying(false);
    setCurrentStep(-1);

    const dist = {};
    const prev = {};
    const known = {};
    const pq = [];
    const newSteps = [];

    nodes.forEach(n => {
      dist[n] = n === startVertex ? 0 : Infinity;
      prev[n] = -1;
      known[n] = false;
    });

    pq.push({ node: startVertex, priority: 0 });

    newSteps.push({
      dist: { ...dist },
      prev: { ...prev },
      known: { ...known },
      pq: [startVertex],
      current: startVertex,
      relaxed: null,
      description: `Starting from node ${startVertex} — distance = 0`
    });

    const settled = new Set();

    while (pq.length > 0) {
      pq.sort((a, b) => a.priority - b.priority);
      const { node: u } = pq.shift();

      if (settled.has(u)) continue;
      settled.add(u);
      known[u] = true;

      newSteps.push({
        dist: { ...dist },
        prev: { ...prev },
        known: { ...known },
        pq: pq.map(p => p.node),
        current: u,
        relaxed: null,
        description: `Node ${u} is now KNOWN — shortest distance = ${dist[u]}`
      });

      edges
        .filter(([from]) => from === u)
        .forEach(([_, v, w]) => {
          const alt = dist[u] + w;
          if (alt < dist[v]) {
            dist[v] = alt;
            prev[v] = u;
            pq.push({ node: v, priority: alt });

            newSteps.push({
              dist: { ...dist },
              prev: { ...prev },
              known: { ...known },
              pq: pq.map(p => p.node),
              current: u,
              relaxed: v,
              description: `Relaxed edge ${u}→${v}: ${dist[u]} + ${w} = ${alt} (better!)`
            });
          }
        });
    }

    newSteps.push({
      dist: { ...dist },
      prev: { ...prev },
      known: { ...known },
      pq: [],
      current: null,
      relaxed: null,
      description: `Algorithm complete! All shortest paths from ${startVertex} found.`
    });

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
    dist: Object.fromEntries(nodes.map(n => [n, n === startVertex ? 0 : Infinity])),
    prev: Object.fromEntries(nodes.map(n => [n, -1])),
    known: Object.fromEntries(nodes.map(n => [n, false])),
    current: startVertex,
    relaxed: null,
    description: "Click 'Run Dijkstra' to find shortest paths!",
  };

  // Add/Remove Node & Edge
  const addNode = () => {
    if (!nodes.includes(newNodeId) && newNodeId >= 0) {
      setNodes(prev => [...prev, newNodeId]);
      setNewNodeId(prev => prev + 1);
    }
  };

  const removeNode = (nodeToRemove) => {
    if (nodes.length <= 1) return;
    setNodes(prev => prev.filter(n => n !== nodeToRemove));
    setEdges(prev => prev.filter(([u, v]) => u !== nodeToRemove && v !== nodeToRemove));
    if (startVertex === nodeToRemove) setStartVertex(nodes[0] || 0);
  };

  const addEdge = () => {
    if (!nodes.includes(fromNode) || !nodes.includes(toNode) || weight <= 0) return;
    const exists = edges.some(([u, v]) => u === fromNode && v === toNode);
    if (!exists) {
      setEdges(prev => [...prev, [fromNode, toNode, weight]]);
    }
  };

  const removeEdge = (u, v) => {
    setEdges(prev => prev.filter(([a, b]) => !(a === u && b === v)));
  };

  // Get full path from start to node using prev
  const getShortestPath = (node, prevMap) => {
    const path = [];
    let current = node;
    while (current !== -1) {
      path.unshift(current);
      current = prevMap[current];
      if (current === undefined) break;
    }
    return path.length > 1 && path[0] === startVertex ? path : null;
  };

  const finalState = steps.length > 0 ? steps[steps.length - 1] : null;

  const drawGraph = () => {
    const isFinal = currentStep === steps.length - 1;

    return (
      <svg className="w-full h-[520px] bg-gray-900 rounded-xl shadow-2xl" viewBox="0 0 600 520">
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="26" refY="4" orient="auto">
            <path d="M0,0 L0,8 L10,4 z" fill="#94a3b8" />
          </marker>
          <marker id="arrowhead-active" markerWidth="9" markerHeight="9" refX="28" refY="4.5" orient="auto">
            <path d="M0,0 L0,9 L12,4.5 z" fill="#f472b6" />
          </marker>
          <marker id="arrowhead-gold" markerWidth="10" markerHeight="10" refX="30" refY="5" orient="auto">
            <path d="M0,0 L0,10 L14,5 z" fill="#fbbf24" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map(([u, v, w]) => {
          const pu = nodePositions.current[u] || { x: 300, y: 250 };
          const pv = nodePositions.current[v] || { x: 300, y: 250 };

          const isRelaxed = currentState.current === u && currentState.relaxed === v;
          const isPathEdge = isFinal && finalState?.prev[v] === u;

          const strokeColor = isPathEdge ? "#fbbf24" : isRelaxed ? "#f472b6" : "#4b5563";
          const strokeWidth = isPathEdge ? 6 : isRelaxed ? 4 : 2;
          const marker = isPathEdge ? "url(#arrowhead-gold)" : isRelaxed ? "url(#arrowhead-active)" : "url(#arrowhead)";

          const midX = (pu.x + pv.x) / 2;
          const midY = (pu.y + pv.y) / 2 - 15;

          return (
            <g key={`${u}-${v}`}>
              <line
                x1={pu.x} y1={pu.y}
                x2={pv.x} y2={pv.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                markerEnd={marker}
                opacity={currentState.known?.[u] ? 1 : 0.4}
                className="transition-all duration-500"
              />
              <text x={midX} y={midY} textAnchor="middle" fontSize="16" fontWeight="bold" fill={isPathEdge ? "#fbbf24" : "#94a3b8"}>
                {w}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map(n => {
          const pos = nodePositions.current[n] || { x: 300, y: 250 };
          const isCurrent = currentState.current === n;
          const isKnown = currentState.known?.[n];
          const isReached = currentState.dist[n] !== Infinity;

          return (
            <g key={n}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="38"
                fill={isCurrent ? "#f472b6" : isKnown ? "#34d399" : isReached ? "#60a5fa" : "#1f2937"}
                stroke={isCurrent ? "#ec4899" : isKnown ? "#10b981" : isReached ? "#3b82f6" : "#6b7280"}
                strokeWidth={isCurrent ? 7 : 4}
                className="transition-all duration-300"
              />
              <text x={pos.x} y={pos.y + 8} textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">
                {n}
              </text>
              {currentState.dist[n] !== Infinity && (
                <text x={pos.x} y={pos.y + 50} textAnchor="middle" fontSize="16" fill="#fbbf24" fontWeight="bold">
                  {currentState.dist[n]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  // Dijkstra Table
  const DijkstraTable = () => {
    const sortedNodes = [...nodes].sort((a, b) => a - b);
    return (
      <div className="bg-gray-900/90 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">Dijkstra's Algorithm Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-700">
            <thead>
              <tr className="bg-gray-800 border-b border-gray-600">
                <th className="px-4 py-3 text-left text-cyan-300 font-bold border-r border-gray-600">Vertex</th>
                <th className="px-4 py-3 text-center text-yellow-300 font-bold border-r border-gray-600">Known</th>
                <th className="px-4 py-3 text-center text-pink-300 font-bold border-r border-gray-600">Cost</th>
                <th className="px-4 py-3 text-center text-green-300 font-bold">Path</th>
              </tr>
            </thead>
            <tbody>
              {sortedNodes.map(n => {
                const path = currentState.prev?.[n] === -1 ? "—" : 
                           currentState.prev?.[n] !== null ? `${n} ← ${currentState.prev[n]}` : "—";
                return (
                  <tr key={n} className={`border-b border-gray-700 hover:bg-gray-800/50 transition-colors ${currentState.current === n || currentState.relaxed === n ? 'bg-pink-900/40' : ''}`}>
                    <td className={`px-4 py-3 font-mono ${currentState.current === n ? 'text-pink-400 font-bold' : 'text-gray-300'}`}>{n}</td>
                    <td className={`px-4 py-3 text-center font-bold ${currentState.known?.[n] ? 'text-green-400' : 'text-red-400'}`}>
                      {currentState.known?.[n] ? 'T' : 'F'}
                    </td>
                    <td className={`px-4 py-3 text-center font-bold ${currentState.relaxed === n ? 'text-pink-400' : 'text-gray-300'}`}>
                      {currentState.dist[n] === Infinity ? '∞' : currentState.dist[n]}
                    </td>
                    <td className={`px-4 py-3 text-center font-mono ${currentState.current === n ? 'text-pink-400' : 'text-gray-300'}`}>
                      {path}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Shortest Paths Summary Panel
  const ShortestPathsSummary = () => {
    if (!finalState || currentStep < steps.length - 1) return null;

    return (
      <div className="mt-8 bg-gray-900/90 backdrop-blur border border-amber-600/60 rounded-2xl p-8 shadow-2xl">
        <h3 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-amber-400 to-pink-400 bg-clip-text text-transparent">
          Shortest Paths from Node {startVertex}
        </h3>
        <div className="space-y-5">
          {nodes
            .filter(n => n !== startVertex)
            .sort((a, b) => a - b)
            .map(node => {
              const path = getShortestPath(node, finalState.prev);
              const cost = finalState.dist[node];

              return (
                <div
                  key={node}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    cost === Infinity
                      ? "bg-red-900/30 border-red-600/70"
                      : "bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border-emerald-500/80 shadow-lg"
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-cyan-300">To Node {node}</span>
                    <span className="text-3xl font-bold text-amber-400">
                      {cost === Infinity ? "Unreachable" : cost}
                    </span>
                  </div>
                  <div className="font-mono text-2xl tracking-wider">
                    {cost === Infinity ? (
                      <span className="text-red-400">No path exists</span>
                    ) : (
                      <span className="text-green-300">
                        {path ? path.join(" → "): `→ ${node}`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <Navbar />

      <div className="w-full bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-pink-400">
            Dijkstra's Shortest Path Algorithm
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
   
  </span> */}
</Link>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10">
        {/* Controls */}
        <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl shadow-2xl p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-pink-400 mb-4">Source Node</h3>
              <select value={startVertex} onChange={(e) => setStartVertex(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white">
                {nodes.map(n => <option key={n} value={n}>Node {n}</option>)}
              </select>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">Add Weighted Edge</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <select value={fromNode} onChange={(e) => setFromNode(Number(e.target.value))} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3">
                    {nodes.map(n => <option key={n}>{n}</option>)}
                  </select>
                  <span className="text-2xl text-pink-400">→</span>
                  <select value={toNode} onChange={(e) => setToNode(Number(e.target.value))} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3">
                    {nodes.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <input type="number" min="1" value={weight} onChange={(e) => setWeight(Number(e.target.value))}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 w-24 text-white" placeholder="Weight" />
                  <button onClick={addEdge} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-6 py-3 rounded-lg font-bold">
                    Add Edge
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Current Graph</h3>
              <div className="text-sm space-y-1">
                <p><strong className="text-pink-400">Nodes:</strong> {nodes.join(", ")}</p>
                <p><strong className="text-cyan-400">Edges:</strong> {edges.map(([u,v,w]) => `${u}→${v}(${w})`).join(", ")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-10">
          <button onClick={runDijkstra}
            className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 text-white text-2xl font-bold px-16 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition duration-300"
         >
            Run Dijkstra's Algorithm
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-gray-900/90 backdrop-blur border border-gray-800 rounded-2xl shadow-2xl p-6">
              <h3 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-amber-400 to-pink-400 bg-clip-text text-transparent">
                Graph Visualization
              </h3>
              <div className="flex justify-center">
                {drawGraph()}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur border border-purple-700 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-pink-300 mb-3">Current Step:</h3>
              <p className="text-xl text-gray-100 leading-relaxed">{currentState.description}</p>
            </div>
          </div>

          <div className="space-y-6">
            <DijkstraTable />
            <ShortestPathsSummary />
          </div>
        </div>

        {steps.length > 0 && (
          <div className="mt-12 bg-gray-900/90 backdrop-blur border border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-wrap items-center justify-center gap-6">
            <button onClick={() => setCurrentStep(0)} className="bg-gray-700 hover:bg-gray-600 px-6 py-4 rounded-xl font-bold">First</button>
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
              <input type="range" min="100" max="3000" step="100" value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-48 accent-pink-500" />
              <span className="text-sm text-gray-400 w-20">{speed}ms</span>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default DijkstraVisualization;
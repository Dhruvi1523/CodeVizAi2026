// src/pages/dsa/DijkstraVisualization.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function DijkstraVisualization() {
  const [nodes, setNodes] = useState([0, 1, 2, 3, 4, 5]);
  const [edges, setEdges] = useState([
    [0, 1, 4], [0, 2, 2], [1, 2, 1], [1, 3, 5],
    [2, 3, 8], [2, 4, 10], [3, 4, 2], [3, 5, 6], [4, 5, 3]
  ]);
  const [startVertex, setStartVertex] = useState(0);
  const [newNodeId, setNewNodeId] = useState(6);

  // Edge controls
  const [fromNode, setFromNode] = useState(0);
  const [toNode, setToNode] = useState(1);
  const [weight, setWeight] = useState(5);
  const [removeFrom, setRemoveFrom] = useState(0);
  const [removeTo, setRemoveTo] = useState(1);

  // Visualization
  const [steps, setSteps] = useState([]);
  const [current, setCurrent] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);

  // Layout
  const [positions, setPositions] = useState({});
  const containerRef = useRef(null);
  const draggingRef = useRef(null);
  const [undoStack, setUndoStack] = useState([]);
  const [removingNodes, setRemovingNodes] = useState(new Set());
  const [arrowStyle, setArrowStyle] = useState("curved");
  const timerRef = useRef(null);
  const fileRef = useRef(null);

  // Auto Layout - same as BFS/DFS
  const updateAutoLayout = (useExisting = true) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const w = Math.max(800, rect.width);
    const h = 620;
    const cx = w / 2, cy = h / 2;
    const radius = Math.min(w, h) * 0.36;

    const target = {};
    if (nodes.includes(startVertex)) target[startVertex] = { x: cx, y: 80 };

    nodes.filter(n => n !== startVertex).forEach((n, i) => {
      const angle = (i / Math.max(1, nodes.length - 1)) * Math.PI * 2 - Math.PI / 2;
      target[n] = {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle) + 40
      };
    });

    setPositions(prev => {
      const next = { ...target };
      if (useExisting) Object.assign(next, prev);
      return next;
    });
  };

  useEffect(() => {
    updateAutoLayout();
    window.addEventListener("resize", updateAutoLayout);
    return () => window.removeEventListener("resize", updateAutoLayout);
  }, [nodes, startVertex]);

  // Dijkstra Algorithm
  const runDijkstra = () => {
    if (!nodes.includes(startVertex)) return;
    setIsPlaying(false);
    setCurrent(-1);

    const dist = Object.fromEntries(nodes.map(n => [n, Infinity]));
    const prev = Object.fromEntries(nodes.map(n => [n, null]));
    const visited = Object.fromEntries(nodes.map(n => [n, false]));
    const newSteps = [];

    dist[startVertex] = 0;

    const addStep = (desc, cur = null, pq = [], updated = []) => {
      newSteps.push({
        dist: { ...dist },
        prev: { ...prev },
        visited: { ...visited },
        pq: [...pq],
        current: cur,
        updated,
        description: desc
      });
    };

    const getPQ = () => nodes
      .filter(n => !visited[n] && dist[n] < Infinity)
      .sort((a, b) => dist[a] - dist[b]);

    addStep(`Initialize: distance[${startVertex}] = 0`, startVertex, getPQ());

    while (true) {
      const pq = getPQ();
      if (pq.length === 0) break;

      const u = pq[0];
      visited[u] = true;
      addStep(`Extract ${u} (dist = ${dist[u]})`, u, pq.slice(1));

      const neighbors = edges.filter(([f]) => f === u).map(([, t, w]) => ({ t, w }));
      const updated = [];

      for (const { t: v, w } of neighbors) {
        if (visited[v]) continue;
        const alt = dist[u] + w;
        if (alt < dist[v]) {
          dist[v] = alt;
          prev[v] = u;
          updated.push(v);
          addStep(`Relax ${u} → ${v}: ${dist[v]} → ${alt}`, u, getPQ(), updated);
        }
      }
    }

    addStep("Dijkstra Complete! Shortest paths found.", null, [], []);
    setSteps(newSteps);
    setCurrent(0);
  };

  useEffect(() => {
    if (!isPlaying || current >= steps.length - 1) {
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setCurrent(c => c + 1), speed);
    return () => clearInterval(timerRef.current);
  }, [isPlaying, current, speed, steps.length]);

  const stepState = steps[current] || {
    dist: Object.fromEntries(nodes.map(n => [n, Infinity])),
    prev: Object.fromEntries(nodes.map(n => [n, null])),
    pq: [], current: null, updated: [], description: "Click Run Dijkstra to start"
  };

  const isComplete = current === steps.length - 1 && steps.length > 0;
  const finalPrev = isComplete ? steps[steps.length - 1].prev : stepState.prev;
  const finalDist = isComplete ? steps[steps.length - 1].dist : stepState.dist;

  const getPathTo = (node) => {
    const path = [];
    let cur = node;
    while (cur !== null) {
      path.unshift(cur);
      if (cur === startVertex) break;
      cur = finalPrev[cur];
    }
    return path.length > 1 && finalDist[node] < Infinity ? path : null;
  };

  // Actions
  const pushUndo = () => setUndoStack(s => [...s, { nodes: [...nodes], edges: [...edges], positions: { ...positions }, startVertex }]);

  const addNode = () => {
    if (nodes.includes(newNodeId)) return;
    pushUndo();
    setNodes(p => [...p, newNodeId]);
    setNewNodeId(n => n + 1);
    setTimeout(() => updateAutoLayout(true), 100);
  };

  const addEdge = () => {
    if (fromNode === toNode || edges.some(e => e[0] === fromNode && e[1] === toNode)) return;
    pushUndo();
    setEdges(p => [...p, [fromNode, toNode, weight]]);
  };

  const removeEdge = () => {
    pushUndo();
    setEdges(p => p.filter(e => !(e[0] === removeFrom && e[1] === removeTo)));
  };

  const handleNodeClick = (id) => {
    if (!confirm(`Delete node ${id} and all its edges?`)) return;
    pushUndo();
    setRemovingNodes(s => new Set([...s, id]));
    setTimeout(() => {
      setNodes(p => p.filter(n => n !== id));
      setEdges(p => p.filter(e => e[0] !== id && e[1] !== id));
      setPositions(p => { const np = { ...p }; delete np[id]; return np; });
      setRemovingNodes(s => { const ns = new Set(s); ns.delete(id); return ns; });
      updateAutoLayout(true);
    }, 420);
  };

  const handleEdgeClick = (u, v) => {
    if (confirm(`Remove edge ${u} → ${v}?`)) {
      pushUndo();
      setEdges(p => p.filter(e => !(e[0] === u && e[1] === v)));
    }
  };

  // Drag handlers
  const onPointerDownNode = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    const pos = positions[id];
    const scaleX = 1000 / rect.width;
    const scaleY = 700 / rect.height;
    draggingRef.current = {
      id,
      offsetX: (clientX - rect.left) * scaleX - pos.x,
      offsetY: (clientY - rect.top) * scaleY - pos.y
    };
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    const scaleX = 1000 / rect.width;
    const scaleY = 700 / rect.height;
    const nx = (clientX - rect.left) * scaleX - draggingRef.current.offsetX;
    const ny = (clientY - rect.top) * scaleY - draggingRef.current.offsetY;
    setPositions(p => ({ ...p, [draggingRef.current.id]: { x: nx, y: ny } }));
  };

  const onPointerUp = () => {
    if (draggingRef.current) pushUndo();
    draggingRef.current = null;
  };

  const handleExport = () => {
    const data = { nodes, edges, positions, startVertex };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dijkstra-graph.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        pushUndo();
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        setPositions(data.positions || {});
        setStartVertex(data.startVertex ?? 0);
        setTimeout(() => updateAutoLayout(false), 100);
      } catch {
        alert("Invalid file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header - EXACTLY SAME AS BFS/DFS */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              Dijkstra's Algorithm
            </h1>
            <p className="text-sm text-gray-400 mt-1">Shortest Path • Drag • Delete • Undo • Final Tree</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-300">Arrows:</label>
            <select value={arrowStyle} onChange={e => setArrowStyle(e.target.value)} className="bg-gray-900 px-3 py-2 rounded">
              <option>curved</option>
              <option>straight</option>
            </select>
            <button onClick={handleExport} className="px-3 py-2 bg-indigo-600 rounded">Export</button>
            <button onClick={() => fileRef.current?.click()} className="px-3 py-2 bg-indigo-500 rounded">Import</button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <button onClick={() => setUndoStack(s => s.slice(0, -1))} disabled={!undoStack.length} className="px-3 py-2 bg-gray-700 rounded disabled:opacity-50">Undo</button>
            <Link to="/graph-dsa" className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded">Back</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Controls */}
        <section className="bg-gray-800/80 border border-gray-700 rounded-2xl p-6 mb-6 shadow-xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-emerald-400 font-semibold mb-1">Start Node</label>
              <select value={startVertex} onChange={e => setStartVertex(+e.target.value)} className="w-full bg-gray-900 px-3 py-2 rounded">
                {nodes.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-green-400 font-semibold mb-1">Add Node</label>
              <div className="flex gap-2">
                <input type="number" value={newNodeId} onChange={e => setNewNodeId(+e.target.value)} className="w-20 bg-gray-900 px-2 py-2 rounded text-center" />
                <button onClick={addNode} className="px-3 py-2 bg-green-600 rounded font-bold">Add</button>
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-purple-400 font-semibold mb-1">Add Edge</label>
              <div className="flex gap-2 items-center">
                <select value={fromNode} onChange={e => setFromNode(+e.target.value)} className="bg-gray-900 px-2 py-2 rounded text-sm">{nodes.map(n => <option key={n}>{n}</option>)}</select>
                <span className="text-pink-400 text-xl">→</span>
                <select value={toNode} onChange={e => setToNode(+e.target.value)} className="bg-gray-900 px-2 py-2 rounded text-sm">{nodes.map(n => <option key={n}>{n}</option>)}</select>
                <input type="number" min="1" value={weight} onChange={e => setWeight(+e.target.value)} className="w-16 bg-gray-900 px-2 py-2 rounded text-center" />
                <button onClick={addEdge} className="px-4 py-2 bg-purple-600 rounded font-bold">+</button>
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-red-400 font-semibold mb-1">Remove Edge</label>
              <div className="flex gap-2 items-center">
                <select value={removeFrom} onChange={e => setRemoveFrom(+e.target.value)} className="bg-gray-900 px-2 py-2 rounded text-sm">{nodes.map(n => <option key={n}>{n}</option>)}</select>
                <span className="text-red-400 text-xl">×</span>
                <select value={removeTo} onChange={e => setRemoveTo(+e.target.value)} className="bg-gray-900 px-2 py-2 rounded text-sm">{nodes.map(n => <option key={n}>{n}</option>)}</select>
                <button onClick={removeEdge} className="px-4 py-2 bg-red-600 rounded font-bold">−</button>
              </div>
            </div>
            <div className="flex items-end">
              <button onClick={runDijkstra} className="w-full px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-bold text-lg shadow-lg hover:shadow-cyan-500/50">
                Run Dijkstra
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graph */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/90 border border-gray-700 rounded-2xl p-4 shadow-2xl">
              <h3 className="text-lg font-semibold text-center text-emerald-300 mb-3">Graph Visualization</h3>
              <div ref={containerRef} className="w-full h-[60vh] bg-gray-900 rounded-xl overflow-hidden border border-gray-700"
                   onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
                <svg className="w-full h-full" viewBox="0 0 1000 700">
                  <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="28" refY="5" orient="auto">
                      <path d="M0,0 L0,10 L10,5 z" fill="#64748b" />
                    </marker>
                    <marker id="arrow-active" markerWidth="14" markerHeight="14" refX="34" refY="7" orient="auto">
                      <path d="M0,0 L0,14 L14,7 z" fill="#ec4899" />
                    </marker>
                  </defs>

                  {/* Edges */}
                  {edges.map(([u, v, w]) => {
                    const p1 = positions[u] || { x: 500, y: 350 };
                    const p2 = positions[v] || { x: 500, y: 350 };
                    const isTreeEdge = finalPrev[v] === u;
                    const isRelaxing = stepState.current === u && stepState.updated.includes(v);

                    const strokeColor = isTreeEdge ? "#ec4899" : isRelaxing ? "#f59e0b" : "#64748b";
                    const strokeWidth = isTreeEdge ? 6 : isRelaxing ? 5 : 3;

                    if (arrowStyle === "straight") {
                      return (
                        <g key={`${u}-${v}`}>
                          <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                            stroke={strokeColor} strokeWidth={strokeWidth}
                            markerEnd={isTreeEdge || isRelaxing ? "url(#arrow-active)" : "url(#arrow)"}
                            onClick={() => handleEdgeClick(u, v)}
                            style={{ cursor: "pointer" }} />
                          <text x={(p1.x + p2.x)/2} y={(p1.y + p2.y)/2 - 10} textAnchor="middle" fontSize="16" fill="#fbbf24" fontWeight="bold">{w}</text>
                        </g>
                      );
                    }

                    const mx = (p1.x + p2.x) / 2;
                    const my = Math.min(p1.y, p2.y) - 60;
                    const d = `M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}`;

                    return (
                      <g key={`${u}-${v}`}>
                        <path d={d} fill="none" stroke={strokeColor} strokeWidth={strokeWidth}
                          markerEnd={isTreeEdge || isRelaxing ? "url(#arrow-active)" : "url(#arrow)"}
                          onClick={() => handleEdgeClick(u, v)}
                          style={{ cursor: "pointer" }} />
                        <text x={mx} y={my - 10} textAnchor="middle" fontSize="16" fill="#fbbf24" fontWeight="bold">{w}</text>
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {nodes.map(n => {
                    const pos = positions[n] || { x: 500, y: 350 };
                    const isRemoving = removingNodes.has(n);
                    const isCurrent = stepState.current === n;
                    const isUpdated = stepState.updated.includes(n);
                    const inTree = finalPrev[n] !== null;
                    const dist = stepState.dist[n];

                    return (
                      <g key={n} transform={`translate(${pos.x},${pos.y})`}
                         onPointerDown={e => onPointerDownNode(e, n)}
                         onClick={e => { e.stopPropagation(); handleNodeClick(n); }}
                         style={{ cursor: "grab", opacity: isRemoving ? 0 : 1, transition: "all 420ms" }}>
                        {isCurrent && <circle r={56} fill="none" stroke="#ec4899" strokeWidth={8} opacity={0.3} />}
                        <circle r={38}
                          fill={isCurrent ? "#ec4899" : isUpdated ? "#f59e0b" : inTree ? "#ec4899" : dist < Infinity ? "#10b981" : "#1e293b"}
                          stroke={isCurrent ? "#fff" : "#374151"} strokeWidth={isCurrent ? 5 : 3} />
                        <text y={6} textAnchor="middle" fontSize="16" fontWeight="700" fill="#fff">{n}</text>
                        <text y={32} textAnchor="middle" fontSize="12" fill="#60a5fa" fontWeight="bold">
                          {dist === Infinity ? "∞" : dist}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="mt-4 p-4 bg-gradient-to-r from-emerald-900/40 to-cyan-900/40 border border-emerald-700 rounded-xl text-center">
                <p className="text-lg font-medium text-gray-100">{stepState.description}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Priority Queue */}
            <div className="bg-gray-800/90 border border-gray-700 rounded-2xl p-5">
              <h4 className="text-lg font-bold text-emerald-400 mb-3">Priority Queue</h4>
              <div className="flex flex-wrap gap-2">
                {stepState.pq.length > 0 ? stepState.pq.map(n => (
                  <span key={n} className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-600 to-amber-600 text-white font-bold text-sm">
                    {n} ({stepState.dist[n] === Infinity ? "∞" : stepState.dist[n]})
                  </span>
                )) : <span className="text-gray-400 italic">Empty</span>}
              </div>
            </div>

            {/* Step-by-step Explanation */}
            <div className="bg-gray-800/90 border border-gray-700 rounded-2xl p-5">
              <h4 className="text-lg font-bold text-cyan-400 mb-3">How Dijkstra Works</h4>
              <ol className="space-y-2 text-sm text-gray-300">
                <li>• Start with distance 0 to source, ∞ to others</li>
                <li>• Always pick node with smallest known distance</li>
                <li>• Update distances to its neighbors if shorter path found</li>
                <li>• Mark as visited once extracted</li>
                <li>• Repeat until all nodes processed</li>
              </ol>
            </div>

            {/* Final Result */}
            {isComplete && (
              <div className="bg-gradient-to-br from-pink-900/70 to-emerald-900/70 border-2 border-pink-600 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-2xl font-bold text-pink-300 text-center mb-4">Final Shortest Paths</h3>
                <div className="space-y-3">
                  {nodes.filter(n => n !== startVertex).map(n => {
                    const path = getPathTo(n);
                    return (
                      <div key={n} className="bg-gray-900/80 rounded-lg p-4 border border-pink-700">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-pink-300">Node {n}</span>
                          <span className={`text-2xl font-bold ${finalDist[n] === Infinity ? "text-red-400" : "text-green-400"}`}>
                            {finalDist[n] === Infinity ? "∞" : finalDist[n]} 
                            {path && <span className="text-gray-300"> (Path: {path.join(" → ")})</span>}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Play Controls */}
            {steps.length > 0 && (
              <div className="bg-gray-800/90 border border-gray-700 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-center gap-2 mb-4">
                  {["First", "Prev"].map(t => (
                    <button key={t} onClick={() => setCurrent(t === "First" ? 0 : Math.max(0, current - 1))}
                      className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium">{t}</button>
                  ))}
                  <button onClick={() => setIsPlaying(!isPlaying)} 
                    className={`px-4 py-1 rounded-lg font-bold text-white text-sm shadow-lg hover:scale-105 transition ${ 
                      isPlaying ? "bg-red-600 hover:bg-red-500" : "bg-emerald-600 hover:bg-emerald-500" }`}>
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  {["Next", "Last"].map(t => (
                    <button key={t} onClick={() => setCurrent(t === "Last" ? steps.length - 1 : Math.min(steps.length - 1, current + 1))}
                      className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium">{t}</button>
                  ))}
                </div>
                <div className="text-center text-gray-300 font-medium mb-4">
                  Step <span className="text-emerald-400 text-xl font-bold">{current + 1}</span> / {steps.length}
                </div>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-gray-400">Speed:</span>
                  <input type="range" min="300" max="3000" step="100" value={speed} onChange={e => setSpeed(+e.target.value)}
                    className="w-32 accent-emerald-500" />
                  <span className="text-gray-400 w-16 text-right">{speed}ms</span>
                </div>
              </div>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
}
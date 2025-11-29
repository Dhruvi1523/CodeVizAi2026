// src/pages/dsa/BFSVisualization.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function BFSVisualization() {
  // ---------- Graph state ----------
  const [graphType, setGraphType] = useState("directed");
  const [nodes, setNodes] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [edges, setEdges] = useState([
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [3, 6],
  ]);
  const [startVertex, setStartVertex] = useState(0);
  const [newNodeId, setNewNodeId] = useState(7);
  const [fromNode, setFromNode] = useState(0);
  const [toNode, setToNode] = useState(1);
  const [removeFrom, setRemoveFrom] = useState(0);
  const [removeTo, setRemoveTo] = useState(1);

  // BFS + playback
  const [steps, setSteps] = useState([]);
  const [current, setCurrent] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);

  // positions & drag
  const [positions, setPositions] = useState({});
  const svgViewBox = useRef({ w: 1000, h: 700 });
  const containerRef = useRef(null);
  const draggingRef = useRef({ id: null, offsetX: 0, offsetY: 0 });
  const pointerCapturedRef = useRef(false);

  // undo & removal
  const [undoStack, setUndoStack] = useState([]);
  const [removingNodes, setRemovingNodes] = useState(new Set());
  const [arrowStyle, setArrowStyle] = useState("curved");
  const timerRef = useRef(null);
  const fileRef = useRef(null);

  // ---------- Layout ----------
  const updateAutoLayout = (useExistingManual = true) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const w = Math.max(700, rect.width);
    const h = Math.max(450, rect.height);
    svgViewBox.current = { w, h };
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.36;
    const target = {};

    if (nodes.includes(startVertex)) {
      target[startVertex] = { x: cx, y: 80 };
    }
    const other = nodes.filter((n) => n !== startVertex);
    other.forEach((node, i) => {
      const angle = (i / Math.max(1, other.length)) * Math.PI * 2 - Math.PI / 2;
      target[node] = {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle) + 30,
      };
    });

    setPositions((prev) => {
      const next = { ...target };
      Object.keys(prev).forEach((k) => {
        if (useExistingManual && !removingNodes.has(Number(k)) && nodes.includes(Number(k))) {
          next[k] = prev[k];
        }
      });
      return next;
    });
  };

  useEffect(() => {
    updateAutoLayout();
    const onResize = () => updateAutoLayout();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [nodes, startVertex]);

  // ---------- BFS ----------
  const buildAdjList = () => {
    const adj = {};
    nodes.forEach((n) => (adj[n] = []));
    edges.forEach(([u, v]) => {
      adj[u].push(v);
      if (graphType === "undirected") {
        if (!adj[v].includes(u)) adj[v].push(u);
      }
    });
    return adj;
  };

  const runBFS = () => {
    if (!nodes.includes(startVertex)) return;
    setIsPlaying(false);
    setCurrent(-1);

    const adj = buildAdjList();
    const visited = Object.fromEntries(nodes.map((n) => [n, false]));
    const queue = [];
    const newSteps = [];

    queue.push(startVertex);
    visited[startVertex] = true;
    newSteps.push({
      queue: [...queue],
      visited: { ...visited },
      current: startVertex,
      processing: null,
      description: `Start BFS from node ${startVertex}`,
    });

    while (queue.length > 0) {
      const u = queue.shift();
      newSteps.push({
        queue: [...queue],
        visited: { ...visited },
        current: u,
        processing: u,
        description: `Dequeue ${u} → exploring neighbors`,
      });

      (adj[u] || []).forEach((v) => {
        if (!visited[v]) {
          visited[v] = true;
          queue.push(v);
          newSteps.push({
            queue: [...queue],
            visited: { ...visited },
            current: u,
            processing: v,
            description: `Discovered node ${v} → enqueue it`,
          });
        }
      });
    }

    newSteps.push({
      queue: [],
      visited: { ...visited },
      current: null,
      processing: null,
      description: "BFS Completed!",
    });

    setSteps(newSteps);
    setCurrent(0);
  };

  // playback
  useEffect(() => {
    if (!isPlaying || current >= steps.length - 1) {
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c >= steps.length - 1 ? c : c + 1));
    }, speed);
    return () => clearInterval(timerRef.current);
  }, [isPlaying, current, speed, steps.length]);

  // ---------- Actions ----------
  const pushUndo = () => {
    setUndoStack((s) => [
      ...s,
      { nodes: [...nodes], edges: [...edges], positions: { ...positions }, startVertex },
    ]);
  };

  const addNode = () => {
    const id = Number(newNodeId);
    if (isNaN(id) || nodes.includes(id)) return;
    pushUndo();
    setNodes((p) => [...p, id]);
    setNewNodeId(id + 1);
    setTimeout(() => updateAutoLayout(true), 100);
  };

  const addEdge = () => {
    if (fromNode === toNode || edges.some(([a, b]) => a === fromNode && b === toNode)) return;
    pushUndo();
    setEdges((p) => [...p, [fromNode, toNode]]);
  };

  const removeEdge = () => {
    pushUndo();
    setEdges((p) => p.filter(([a, b]) => !(a === removeFrom && b === removeTo)));
  };

  const handleEdgeClick = (u, v) => {
    if (window.confirm(`Remove edge ${u} → ${v}?`)) {
      pushUndo();
      setEdges((p) => p.filter(([a, b]) => !(a === u && b === v)));
    }
  };

  const handleNodeClick = (nodeId) => {
    if (!window.confirm(`Delete node ${nodeId}?`)) return;
    pushUndo();
    setRemovingNodes((s) => new Set([...s, nodeId]));
    setTimeout(() => {
      setNodes((p) => p.filter((n) => n !== nodeId));
      setEdges((p) => p.filter(([u, v]) => u !== nodeId && v !== nodeId));
      setPositions((p) => {
        const np = { ...p };
        delete np[nodeId];
        return np;
      });
      setRemovingNodes((s) => {
        const ns = new Set(s);
        ns.delete(nodeId);
        return ns;
      });
      setTimeout(() => updateAutoLayout(true), 50);
    }, 420);
  };

  // drag handlers
  const onPointerDownNode = (e, nodeId) => {
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const px = e.clientX ?? e.touches[0].clientX;
    const py = e.clientY ?? e.touches[0].clientY;
    const pos = positions[nodeId];
    const scaleX = svgViewBox.current.w / rect.width;
    const scaleY = svgViewBox.current.h / rect.height;
    draggingRef.current = {
      id: nodeId,
      offsetX: (px - rect.left) * scaleX - pos.x,
      offsetY: (py - rect.top) * scaleY - pos.y,
    };
    pointerCapturedRef.current = true;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const onPointerMove = (ev) => {
    if (!pointerCapturedRef.current || !draggingRef.current.id) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = svgViewBox.current.w / rect.width;
    const scaleY = svgViewBox.current.h / rect.height;
    const nx = (ev.clientX - rect.left) * scaleX - draggingRef.current.offsetX;
    const ny = (ev.clientY - rect.top) * scaleY - draggingRef.current.offsetY;
    setPositions((p) => ({ ...p, [draggingRef.current.id]: { x: nx, y: ny } }));
  };

  const onPointerUp = () => {
    if (draggingRef.current.id) pushUndo();
    pointerCapturedRef.current = false;
    draggingRef.current = { id: null, offsetX: 0, offsetY: 0 };
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  };

  const handleExport = () => {
    const data = { nodes, edges, positions, startVertex, graphType };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bfs-graph.json";
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
        setGraphType(data.graphType || "directed");
        setTimeout(() => updateAutoLayout(false), 100);
      } catch (err) {
        alert("Invalid file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ---------- Render ----------
  const stepState = steps[current] || {
    queue: [],
    visited: Object.fromEntries(nodes.map((n) => [n, false])),
    current: null,
    processing: null,
    description: "Click 'Run BFS' to begin visualization",
  };
  const visitedList = Object.keys(stepState.visited || {}).filter((k) => stepState.visited[k]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              BFS Visualizer
            </h1>
            <p className="text-sm text-gray-400 mt-1">Drag nodes • Animated remove • Undo • Import/Export</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-300">Arrows:</label>
            <select value={arrowStyle} onChange={(e) => setArrowStyle(e.target.value)} className="bg-gray-900 px-3 py-2 rounded">
              <option value="curved">Curved</option>
              <option value="straight">Straight</option>
            </select>
            <button onClick={handleExport} className="px-3 py-2 bg-indigo-600 rounded">Export</button>
            <button onClick={() => fileRef.current?.click()} className="px-3 py-2 bg-indigo-500 rounded">Import</button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <button onClick={() => setUndoStack((s) => s.slice(0, -1))} disabled={undoStack.length === 0} className="px-3 py-2 bg-gray-700 rounded disabled:opacity-50">
              Undo
            </button>
            <Link to="/graph-dsa" className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded">Back</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Top Controls */}
        <section className="bg-gray-800/80 border border-gray-700 rounded-2xl p-6 shadow mb-6">
          <div className="flex flex-wrap items-end gap-6">
            <div className="min-w-[160px] flex-1">
              <label className="block text-emerald-400 font-semibold mb-1">Graph Type</label>
              <select value={graphType} onChange={(e) => setGraphType(e.target.value)} className="w-full bg-gray-900 px-3 py-2 rounded">
                <option value="directed">Directed</option>
                <option value="undirected">Undirected</option>
              </select>
            </div>
            <div className="min-w-[160px] flex-1">
              <label className="block text-cyan-400 font-semibold mb-1">Start Node</label>
              <select value={startVertex} onChange={(e) => setStartVertex(Number(e.target.value))} className="w-full bg-gray-900 px-3 py-2 rounded">
                {nodes.map((n) => <option key={n} value={n}>Node {n}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <div>
                <label className="block text-green-400 font-semibold mb-1">Add Node (ID)</label>
                <input type="number" value={newNodeId} onChange={(e) => setNewNodeId(Number(e.target.value))} className="w-24 bg-gray-900 px-3 py-2 rounded text-center" />
              </div>
              <button onClick={addNode} className="px-3 py-2 bg-green-600 rounded">Add</button>
            </div>
            <div className="ml-auto flex items-end gap-2">
              <select value={fromNode} onChange={(e) => setFromNode(Number(e.target.value))} className="bg-gray-900 px-2 py-2 rounded">
                {nodes.map((n) => <option key={`f${n}`} value={n}>{n}</option>)}
              </select>
              <span className="text-pink-400 text-xl">→</span>
              <select value={toNode} onChange={(e) => setToNode(Number(e.target.value))} className="bg-gray-900 px-2 py-2 rounded">
                {nodes.map((n) => <option key={`t${n}`} value={n}>{n}</option>)}
              </select>
              <button onClick={addEdge} className="px-3 py-2 bg-purple-600 rounded">+</button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-red-400 font-semibold">Remove Edge</span>
            <select value={removeFrom} onChange={(e) => setRemoveFrom(Number(e.target.value))} className="bg-gray-900 px-2 py-2 rounded">
              {nodes.map((n) => <option key={`rf${n}`} value={n}>{n}</option>)}
            </select>
            <span className="text-red-400 text-xl">→</span>
            <select value={removeTo} onChange={(e) => setRemoveTo(Number(e.target.value))} className="bg-gray-900 px-2 py-2 rounded">
              {nodes.map((n) => <option key={`rt${n}`} value={n}>{n}</option>)}
            </select>
            <button onClick={removeEdge} className="px-3 py-2 bg-red-600 rounded">Remove Edge</button>
            <div className="ml-auto">
              <button onClick={runBFS} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full font-bold">Run BFS</button>
            </div>
          </div>
        </section>

        {/* Main Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graph */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/90 border border-gray-700 rounded-2xl p-4 shadow">
              <h3 className="text-lg font-semibold text-center text-emerald-300 mb-2">Graph Visualization</h3>
              <p className="text-xs text-gray-400 text-center mb-4">Drag nodes • Click node to delete • Click edge to delete</p>
              <div ref={containerRef} className="w-full h-[60vh] sm:h-[70vh] bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
                <svg className="w-full h-full" viewBox={`0 0 ${svgViewBox.current.w} ${svgViewBox.current.h}`} preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="28" refY="5" orient="auto">
                      <path d="M0,0 L0,10 L10,5 z" fill="#60a5fa" />
                    </marker>
                    <marker id="arrow-active" markerWidth="14" markerHeight="14" refX="34" refY="7" orient="auto">
                      <path d="M0,0 L0,14 L14,7 z" fill="#ec4899" />
                    </marker>
                  </defs>

                  {/* Edges */}
                  {edges.map(([u, v], idx) => {
                    const p1 = positions[u] || { x: 500, y: 350 };
                    const p2 = positions[v] || { x: 500, y: 350 };
                    if (arrowStyle === "straight") {
                      return (
                        <g key={`e-${idx}`}>
                          <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#6b7280" strokeWidth={3} markerEnd="url(#arrow)" onClick={() => handleEdgeClick(u, v)} style={{ cursor: "pointer" }} />
                          <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="transparent" strokeWidth={20} onClick={() => handleEdgeClick(u, v)} />
                        </g>
                      );
                    }
                    const mx = (p1.x + p2.x) / 2;
                    const my = Math.min(p1.y, p2.y) - 40;
                    const d = `M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}`;
                    return (
                      <g key={`e-${idx}`}>
                        <path d={d} fill="none" stroke="#6b7280" strokeWidth={3} markerEnd="url(#arrow)" onClick={() => handleEdgeClick(u, v)} style={{ cursor: "pointer" }} />
                        <path d={d} fill="none" stroke="transparent" strokeWidth={22} onClick={() => handleEdgeClick(u, v)} />
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {nodes.map((n) => {
                    const pos = positions[n] || { x: 500, y: 350 };
                    const isRemoving = removingNodes.has(n);
                    const isCurrent = stepState.current === n;
                    const isProcessing = stepState.processing === n;
                    const isVisited = stepState.visited?.[n];
                    const inQueue = stepState.queue?.includes(n);
                    const fillColor = isCurrent ? "#ec4899" : isProcessing ? "#f59e0b" : isVisited ? "#10b981" : inQueue ? "#3b82f6" : "#0f1724";

                    return (
                      <g
                        key={`n-${n}`}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        onPointerDown={(e) => onPointerDownNode(e, n)}
                        onClick={(e) => { if (!draggingRef.current.id && !(e.metaKey || e.ctrlKey)) handleNodeClick(n); }}
                        style={{ cursor: "grab", transition: "transform 420ms ease, opacity 420ms ease", opacity: isRemoving ? 0 : 1 }}
                      >
                        {(isCurrent || isProcessing) && <circle r={56} fill="none" stroke="#10b981" strokeWidth={8} opacity={0.12} />}
                        <circle r={38} fill={fillColor} stroke={isCurrent || isProcessing ? "#fff" : "#374151"} strokeWidth={isCurrent || isProcessing ? 4 : 3} />
                        <text y={6} textAnchor="middle" fontSize={16} fontWeight={700} fill="#fff">{n}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="mt-4 p-3 rounded bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-700 text-center">
                <p className="text-sm text-gray-100">{stepState.description}</p>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-4">
            {/* Queue */}
            <div className="bg-gray-800/90 border border-gray-700 rounded-2xl p-4">
              <h4 className="text-lg text-emerald-400 font-semibold">Queue</h4>
              <div className="mt-3 flex gap-2 flex-wrap">
                {stepState.queue?.length > 0 ? stepState.queue.map((q) => <span key={q} className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 font-bold">{q}</span>) : <div className="text-gray-400 italic">Empty</div>}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800/90 border border-gray-700 rounded-xl p-3 text-center">
                <p className="text-sm text-gray-400">Visited</p>
                <p className="text-2xl font-bold text-emerald-400">{visitedList.length}</p>
              </div>
              <div className="bg-gray-800/90 border border-gray-700 rounded-xl p-3 text-center">
                <p className="text-sm text-gray-400">Edges</p>
                <p className="text-2xl font-bold text-cyan-400">{edges.length}</p>
              </div>
            </div>

            {/* Speed */}
            <div className="bg-gray-800/90 border border-gray-700 rounded-xl p-3">
              <label className="text-sm text-pink-400 font-semibold">Animation Speed</label>
              <input type="range" min="200" max="2000" step="100" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="mt-2 w-full accent-pink-500" />
              <p className="text-xs text-gray-300 mt-2 text-center">{speed} ms</p>
            </div>

            {/* PLAYBACK CONTROLS — ONLY THIS IS CHANGED TO MATCH YOUR IMAGE */}
            {steps.length > 0 && (
              <div className="bg-gray-800/90 border border-gray-700 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <button onClick={() => setCurrent(0)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition">
                    First
                  </button>
                  <button onClick={() => setCurrent(c => Math.max(0, c - 1))} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition">
                    Prev
                  </button>
                  <button
                    onClick={() => setIsPlaying(p => !p)}
                    className={`px-10 py-3 rounded-lg font-bold text-white transition-all transform hover:scale-105 shadow-lg ${
                      isPlaying ? "bg-red-600 hover:bg-red-500" : "bg-emerald-600 hover:bg-emerald-500"
                    }`}
                  >
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button onClick={() => setCurrent(c => Math.min(steps.length - 1, c + 1))} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition">
                    Next
                  </button>
                  <button onClick={() => setCurrent(steps.length - 1)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition">
                    Last
                  </button>
                </div>
                <div className="text-center text-gray-400 text-sm font-medium">
                  Step <span className="text-cyan-400 font-bold">{current + 1}</span> / {steps.length}
                </div>
              </div>
            )}

            {/* Algorithm Step */}
            <div className="bg-gray-800/90 border border-gray-700 rounded-2xl p-4">
              <h4 className="text-lg text-cyan-400 font-semibold mb-2">Algorithm Step {current + 1 > 0 ? current + 1 : 0}</h4>
              <p className="text-sm text-gray-200 mb-3">{stepState.description}</p>
              <div className="text-sm text-gray-300 space-y-2">
                <div><span className="text-gray-400">Queue:</span> <code className="ml-2 text-emerald-300">[{(stepState.queue || []).join(", ") || "empty"}]</code></div>
                <div><span className="text-gray-400">Visited:</span> <code className="ml-2 text-yellow-300">[{visitedList.join(", ") || "none"}]</code></div>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
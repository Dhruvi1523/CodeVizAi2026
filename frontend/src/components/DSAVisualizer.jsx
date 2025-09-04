import React, { useEffect, useRef, useState } from "react";

/*
  DSAVisualizer.jsx

  - Visualizes Stack (LIFO) and Queue (FIFO)
  - Push/Pop for Stack, Enqueue/Dequeue for Queue
  - Speed control, Clear, Load sample
  - Optimistic animations + backend sync via POST to `apiBase`
  - Tailwind CSS used for quick styling
  - Usage: <DSAVisualizer apiBase="/api/dsa" />
*/

export default function DSAVisualizer({ apiBase = "/api/dsa" }) {
  const [mode, setMode] = useState("stack"); // 'stack' or 'queue'
  const [items, setItems] = useState([]); // stack: top at index 0; queue: front at 0
  const [value, setValue] = useState("");
  const [speed, setSpeed] = useState(400); // ms animation duration
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState("");

  // local visual nodes for animation control
  const [nodes, setNodes] = useState([]);
  const nextId = useRef(1);

  useEffect(() => {
    // map items -> nodes (simple sync)
    setNodes(items.map((v) => ({ id: `n-${nextId.current++}`, value: v, status: "idle" })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // call backend with payload: { mode, action, value? }
  async function callBackend(payload) {
    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("Backend call failed:", err);
      throw err;
    }
  }

  // Animations: add node
  function animateAdd(val) {
    const id = `n-${nextId.current++}`;
    const node = { id, value: val, status: "enter" };

    if (mode === "stack") {
      // show top as first element
      setNodes((prev) => [node, ...prev.map((n) => ({ ...n }))]);
    } else {
      setNodes((prev) => [...prev.map((n) => ({ ...n })), node]);
    }

    setTimeout(() => {
      setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, status: "idle" } : n)));
    }, speed + 30);
  }

  // animate remove at index (0 for our operations)
  function animateRemove(targetIndex) {
    setNodes((prev) => prev.map((n, idx) => (idx === targetIndex ? { ...n, status: "leave" } : n)));
    setTimeout(() => {
      setNodes((prev) => prev.filter((_, idx) => idx !== targetIndex));
    }, speed + 30);
  }

  async function handlePush() {
    if (!value.trim()) return setMessage("Enter a value to push/enqueue.");
    setMessage("");
    setIsBusy(true);
    try {
      // optimistic visual add
      animateAdd(value);

      const payload = { mode, action: mode === "stack" ? "push" : "enqueue", value };
      const result = await callBackend(payload);

      if (result && Array.isArray(result.items)) setItems(result.items);
      else setItems((prev) => (mode === "stack" ? [value, ...prev] : [...prev, value]));

      setValue("");
    } catch (err) {
      setMessage("Server error — action may not have been saved.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handlePop() {
    if (items.length === 0) return setMessage("Nothing to pop/dequeue.");
    setMessage("");
    setIsBusy(true);
    try {
      // target index = 0 in our representation
      const targetIndex = 0;
      animateRemove(targetIndex);

      const payload = { mode, action: mode === "stack" ? "pop" : "dequeue" };
      const result = await callBackend(payload);

      if (result && Array.isArray(result.items)) setItems(result.items);
      else setItems((prev) => prev.slice(1));
    } catch (err) {
      setMessage("Server error — action may not have been saved.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleClear() {
    setIsBusy(true);
    setMessage("");
    try {
      animateClear();
      const payload = { mode, action: "clear" };
      const result = await callBackend(payload);
      setItems(Array.isArray(result.items) ? result.items : []);
    } catch (err) {
      setItems([]);
      setMessage("Server error clearing. Cleared locally.");
    } finally {
      setIsBusy(false);
    }
  }

  function animateClear() {
    setNodes((prev) => prev.map((n) => ({ ...n, status: "leave" })));
    setTimeout(() => setNodes([]), speed + 40);
  }

  function loadSample() {
    const sample = mode === "stack" ? ["C", "B", "A"] : ["1", "2", "3"];
    setItems(sample);
    setMessage("Loaded a local sample. Perform actions to sync with backend.");
  }

  const label = mode === "stack" ? "Stack (top → bottom)" : "Queue (front → back)";

  return (
    <div className="p-4 bg-slate-900 text-slate-100 min-h-[480px] rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">DSA Visualizer</h2>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setMode("stack")}
            className={`px-3 py-1 rounded ${mode === "stack" ? "bg-indigo-600" : "bg-slate-700"}`}
          >
            Stack
          </button>
          <button
            onClick={() => setMode("queue")}
            className={`px-3 py-1 rounded ${mode === "queue" ? "bg-indigo-600" : "bg-slate-700"}`}
          >
            Queue
          </button>
        </div>
      </div>

      <div className="border border-slate-800 rounded p-3 mb-4 bg-slate-800">
        <div className="flex gap-2 items-center flex-wrap">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={mode === "stack" ? "Value to push" : "Value to enqueue"}
            className="px-3 py-2 rounded bg-slate-900 border border-slate-700 min-w-[180px]"
            disabled={isBusy}
          />

          <button onClick={handlePush} disabled={isBusy} className="px-3 py-2 rounded bg-emerald-600">
            {mode === "stack" ? "Push" : "Enqueue"}
          </button>

          <button onClick={handlePop} disabled={isBusy} className="px-3 py-2 rounded bg-red-600">
            {mode === "stack" ? "Pop" : "Dequeue"}
          </button>

          <button onClick={handleClear} disabled={isBusy} className="px-3 py-2 rounded bg-slate-700">
            Clear
          </button>

          <button onClick={loadSample} disabled={isBusy} className="px-3 py-2 rounded bg-slate-700">
            Load Sample
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm">Speed</label>
            <input
              type="range"
              min={100}
              max={1200}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="h-2"
            />
            <div className="text-sm w-12 text-right">{speed}ms</div>
          </div>
        </div>
        {message && <div className="mt-2 text-sm text-amber-400">{message}</div>}
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className="mb-2 text-slate-300">{label}</div>

          <div className="bg-slate-800 rounded p-4 min-h-[260px] flex flex-col items-center justify-start overflow-auto">
            <div className={`w-full max-w-xl flex ${mode === "stack" ? "flex-col" : "flex-row gap-2 items-end"}`}>
              {nodes.length === 0 && <div className="text-slate-500 p-6">Empty. Push / Enqueue to add items.</div>}

              {mode === "stack" && (
                <div className="w-full flex flex-col items-center gap-3">
                  {nodes.map((n, idx) => (
                    <VisualNode key={n.id} node={n} idx={idx} speed={speed} mode={mode} />
                  ))}
                </div>
              )}

              {mode === "queue" && (
                <div className="w-full flex gap-3 py-2 items-end overflow-auto">
                  {nodes.map((n, idx) => (
                    <VisualNode key={n.id} node={n} idx={idx} speed={speed} mode={mode} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-64 border border-slate-800 rounded p-3 bg-slate-800">
          <div className="text-slate-300 mb-2">State</div>
          <div className="text-sm mb-2">
            Mode: <strong>{mode}</strong>
          </div>
          <div className="text-sm mb-2">
            Count: <strong>{items.length}</strong>
          </div>

          <div className="text-slate-300 mt-2">Items (from front/top → back/bottom)</div>
          <div className="mt-2 bg-slate-900 p-2 rounded min-h-[80px] max-h-[220px] overflow-auto">
            {items.length === 0 && <div className="text-slate-500 text-sm">(empty)</div>}
            <ol className="list-decimal list-inside text-sm">
              {items.map((it, i) => (
                <li key={`item-${i}`}>{String(it)}</li>
              ))}
            </ol>
          </div>

          <div className="mt-4 text-xs text-slate-400">Backend endpoint:</div>
          <div className="text-sm">{apiBase}</div>
          <div className="mt-4 text-xs text-slate-400">Expected backend payload:</div>
          <pre className="text-xs bg-slate-900 p-2 rounded mt-2">
            {`{ mode: 'stack'|'queue', action: 'push'|'pop'|'enqueue'|'dequeue'|'clear', value?: string }`}
          </pre>
        </div>
      </div>
    </div>
  );
}

// VisualNode component
function VisualNode({ node, idx, speed, mode }) {
  // node.status: 'enter' | 'idle' | 'leave'
  const { value, status } = node;

  const base = "rounded p-3 min-w-[60px] min-h-[40px] border border-slate-700 flex items-center justify-center text-sm font-medium";

  const enterStyle = {
    transform: mode === "stack" ? "translateY(-20px) scale(0.98)" : "translateY(20px) scale(0.98)",
    opacity: 0,
  };

  const leaveStyle = { opacity: 0, transform: "scale(0.9) translateY(8px)" };
  const idleStyle = { opacity: 1, transform: "none" };

  const style = {
    transition: `all ${speed}ms ease`,
    ...(status === "enter" ? enterStyle : status === "leave" ? leaveStyle : idleStyle),
  };

  return (
    <div style={style} className={`${base} bg-slate-700`}>
      <div className="truncate px-1">{value}</div>
    </div>
  );
}

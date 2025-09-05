import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowDownCircle, ArrowUpCircle, ChevronLeft } from "lucide-react";

// --- Visual Node Sub-component (Theme Applied) ---
// The animation logic remains the same, only colors are updated.
const VisualNode = ({ node }) => {
  const { value, status } = node;
  const ANIM_MS = 300;
  
  const baseStyle = {
    transition: `all ${ANIM_MS}ms cubic-bezier(0.2, 0.9, 0.2, 1)`,
    minWidth: 70,
    padding: "12px 16px",
    margin: "0 6px",
    textAlign: "center",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "18px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.25)",
  };

  // Logic for enter/leave animation
  const style =
    status === "enter"
      ? { ...baseStyle, transform: "scale(0.8)", opacity: 0 }
      : status === "leave"
      ? { ...baseStyle, transform: "scale(0.8)", opacity: 0 }
      : { ...baseStyle, transform: "scale(1)", opacity: 1 };

  return (
    <div style={style} className="bg-[#6366f1] text-[#f1f5f9]">
      {value}
    </div>
  );
};


// --- Main Visualizer Component ---
export default function QueueVisualizer() {
  const [nodes, setNodes] = useState([]);
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const nextId = useRef(1);
  const ANIM_MS = 300;

  const front = nodes.length ? nodes[0].value : null;
  const rear = nodes.length ? nodes[nodes.length - 1].value : null;
  
  // --- Core Logic (Unchanged) ---
  const addHistory = (type, val) => {
    setHistory((prev) => [{ type, val, id: Date.now() }, ...prev.slice(0, 9)]);
  };
  const handleEnqueue = () => {
    if (!value.trim()) {
      setMessage("Enter a value to enqueue."); return;
    }
    setIsBusy(true); setMessage("");
    const id = nextId.current++;
    const node = { id, value: value.trim(), status: "enter" };
    setNodes((prev) => [...prev, node]); // Add to the end
    setTimeout(() => {
      setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, status: "idle" } : n)));
      setIsBusy(false);
      addHistory("enqueue", node.value);
    }, ANIM_MS);
    setValue("");
  };
  const handleDequeue = () => {
    if (nodes.length === 0) {
      setMessage("Queue is empty — nothing to dequeue."); return;
    }
    setIsBusy(true); setMessage("");
    const dequeued = nodes[0];
    setNodes((prev) => prev.map((n, idx) => (idx === 0 ? { ...n, status: "leave" } : n)));
    setTimeout(() => {
      setNodes((prev) => prev.slice(1)); // Remove from the front
      setIsBusy(false);
      addHistory("dequeue", dequeued.value);
    }, ANIM_MS);
  };
  const handlePeek = () => {
    if (nodes.length === 0) {
      setMessage("Queue is empty."); return;
    }
    setMessage(`Front element is: ${front}`);
  };
  const handleReset = () => {
    setIsBusy(true); setMessage(""); setHistory([]);
    setNodes((prev) => prev.map((n) => ({ ...n, status: "leave" })));
    setTimeout(() => {
      setNodes([]);
      setIsBusy(false);
    }, ANIM_MS + 100);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9] p-4 sm:p-6 lg:p-8 flex flex-col">
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] flex flex-col flex-grow min-h-0">
        
        <div className="flex items-center gap-4 p-4 border-b border-[#334155] flex-shrink-0">
          <Link to="/dsa-visualizer" className="p-2 text-[#94a3b8] hover:bg-[#334155] hover:text-[#f1f5f9] rounded-full transition-colors" title="Back to Data Structures">
            <ChevronLeft size={20} />
          </Link>
          <div className="w-px h-6 bg-[#334155]"></div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#f1f5f9]">Queue</h1>
            <p className="text-sm text-[#94a3b8]">A First-In-First-Out (FIFO) data structure.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 flex-grow min-h-0">
          
          <main className="lg:col-span-2 bg-[#0f172a] rounded-lg p-4 flex flex-col items-center justify-center relative">
            
              <div className="w-full h-32 bg-[#0f172a] border-2 border-[#334155] rounded-lg flex items-center p-4 overflow-x-auto">
                <span className="font-bold text-[#94a3b8] mr-4">Front</span>
                <div className="flex-grow flex items-center">
                    {nodes.length === 0 && <p className="w-full text-center text-[#94a3b8]">Queue is empty</p>}
                    {nodes.map((node) => ( <VisualNode key={node.id} node={node} /> ))}
                </div>
                <span className="font-bold text-[#94a3b8] ml-4">Rear</span>
              </div>
          </main>

          <aside className="h-full overflow-y-auto pr-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#94a3b8]">Front Element:</span>
                <code className="bg-[#0f172a] px-3 py-1 rounded-md text-lg font-bold text-[#f1f5f9]">{front ?? "–"}</code>
              </div>
               <div className="flex items-center justify-between">
                <span className="font-semibold text-[#94a3b8]">Rear Element:</span>
                <code className="bg-[#0f172a] px-3 py-1 rounded-md text-lg font-bold text-[#f1f5f9]">{rear ?? "–"}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#94a3b8]">Queue Size:</span>
                <code className="bg-[#0f172a] px-3 py-1 rounded-md text-lg font-bold text-[#f1f5f9]">{nodes.length}</code>
              </div>
            </div>

            <hr className="my-6 border-[#334155]" />
            
            <div>
              <label className="block text-sm font-medium text-[#94a3b8]">Value</label>
              <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter a value" className="mt-1 w-full px-3 py-2 rounded-md border border-[#334155] bg-[#0f172a] text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-[#6366f1]" disabled={isBusy} />
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={handleEnqueue} disabled={isBusy} className="bg-[#6366f1] hover:opacity-90 text-[#f1f5f9] px-3 py-2 rounded-md font-semibold disabled:opacity-50">Enqueue</button>
                <button onClick={handleDequeue} disabled={isBusy} className="bg-[#334155] hover:bg-opacity-80 text-[#f1f5f9] px-3 py-2 rounded-md font-semibold disabled:opacity-50">Dequeue</button>
                <button onClick={handlePeek} disabled={isBusy} className="bg-[#8b5cf6] hover:opacity-90 text-[#f1f5f9] px-3 py-2 rounded-md font-semibold disabled:opacity-50">Peek</button>
                <button onClick={handleReset} disabled={isBusy} className="bg-[#ef4444] hover:opacity-90 text-[#f1f5f9] px-3 py-2 rounded-md font-semibold disabled:opacity-50">Reset</button>
              </div>
            </div>
            
            {message && <p className="mt-4 text-sm text-[#f59e0b] text-center">{message}</p>}
            <hr className="my-6 border-[#334155]" />
            
            <div>
              <h4 className="text-md font-semibold mb-3">Operation History</h4>
              <ul className="space-y-2 text-sm text-[#94a3b8] h-32 overflow-y-auto">
                {history.length > 0 ? history.map((h) => (
                  <li key={h.id} className="flex items-center gap-2">
                    {h.type === "enqueue" ? <ArrowDownCircle className="text-[#14b8a6] w-4 h-4 flex-shrink-0" /> : <ArrowUpCircle className="text-[#ef4444] w-4 h-4 flex-shrink-0" />}
                    <span>{h.type.charAt(0).toUpperCase() + h.type.slice(1)}: <strong>{h.val}</strong></span>
                  </li>
                )) : <li>No operations yet.</li>}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
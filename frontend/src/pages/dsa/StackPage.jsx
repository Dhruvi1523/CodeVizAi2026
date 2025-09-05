import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowDownCircle, ArrowUpCircle, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Visual Node Sub-component (Unchanged) ---
const VisualNode = ({ value }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    className="bg-[#6366f1] text-[#f1f5f9] w-60 text-center py-3 rounded-lg font-bold text-lg shadow-lg"
  >
    {value}
  </motion.div>
);

// --- Main Visualizer Component ---
export default function StackVisualizer() {
  const [nodes, setNodes] = useState([]);
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const nextId = useRef(1);
  const ANIM_MS = 300;

  // ... (All logic functions like handlePush, handlePop, etc. remain exactly the same)
  const addHistory = (type, val) => {
    setHistory((prev) => [{ type, val, id: Date.now() }, ...prev.slice(0, 9)]);
  };
  const handlePush = () => {
    if (!value.trim()) {
      setMessage("Enter a value to push."); return;
    }
    setIsBusy(true); setMessage("");
    const id = nextId.current++;
    const node = { id, value: value.trim() };
    setNodes((prev) => [node, ...prev]);
    addHistory("push", node.value);
    setValue("");
    setTimeout(() => setIsBusy(false), ANIM_MS);
  };
  const handlePop = () => {
    if (nodes.length === 0) {
      setMessage("Stack is empty — nothing to pop."); return;
    }
    setIsBusy(true); setMessage("");
    addHistory("pop", nodes[0].value);
    setNodes((prev) => prev.slice(1));
    setTimeout(() => setIsBusy(false), ANIM_MS);
  };
  const handlePeek = () => {
    if (nodes.length === 0) {
      setMessage("Stack is empty."); return;
    }
    setMessage(`Top element is: ${nodes[0].value}`);
  };
  const handleReset = () => {
    setIsBusy(true); setMessage(""); setHistory([]); setNodes([]);
    setTimeout(() => setIsBusy(false), ANIM_MS + 100);
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
            <h1 className="text-2xl font-extrabold text-[#f1f5f9]">Stack</h1>
            <p className="text-sm text-[#94a3b8]">A Last-In-First-Out (LIFO) data structure.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 flex-grow min-h-0">
          
          {/* --- VISUALIZER PANEL (SHAPE CORRECTED) --- */}
          <main className="lg:col-span-2 bg-[#0f172a] rounded-lg p-4 flex flex-col items-center justify-end relative">
            <div className="relative w-[300px] h-full">
              {/* Left Wall */}
              <div className="absolute top-0 bottom-5 left-0 w-2 bg-[#334155] rounded-l-md"></div>
              {/* Right Wall */}
              <div className="absolute top-0 bottom-5 right-0 w-2 bg-[#334155] rounded-r-md"></div>
              {/* Bottom Wall */}
              <div className="absolute bottom-0 left-0 right-0 h-5 bg-[#334155] rounded-b-lg"></div>

              {/* Node Container */}
              <div className="absolute inset-0 top-4 bottom-5 flex flex-col-reverse items-center gap-3 overflow-y-auto p-2">
                <AnimatePresence>
                  {nodes.map((node) => (
                    <VisualNode key={node.id} value={node.value} />
                  ))}
                </AnimatePresence>
                {nodes.length === 0 && <p className="text-[#94a3b8] absolute top-1/2 -translate-y-1/2">Stack is empty</p>}
              </div>
            </div>
          </main>

          {/* Control Panel */}
          <aside className="h-full overflow-y-auto pr-2">
            {/* ... (Control Panel content is unchanged) ... */}
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="font-semibold text-[#94a3b8]">Top Element:</span><code className="bg-[#0f172a] px-3 py-1 rounded-md text-lg font-bold text-[#f1f5f9]">{nodes.length > 0 ? nodes[0].value : "–"}</code></div>
              <div className="flex items-center justify-between"><span className="font-semibold text-[#94a3b8]">Stack Size:</span><code className="bg-[#0f172a] px-3 py-1 rounded-md text-lg font-bold text-[#f1f5f9]">{nodes.length}</code></div>
            </div>
            <hr className="my-6 border-[#334155]" />
            <div>
              <label className="block text-sm font-medium text-[#94a3b8]">Value</label>
              <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter a value" className="mt-1 w-full px-3 py-2 rounded-md border border-[#334155] bg-[#0f172a] text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-[#6366f1]" disabled={isBusy} />
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={handlePush} disabled={isBusy} className="bg-[#6366f1] hover:opacity-90 text-[#f1f5f9] px-3 py-2 rounded-md font-semibold disabled:opacity-50">Push</button>
                <button onClick={handlePop} disabled={isBusy} className="bg-[#334155] hover:bg-opacity-80 text-[#f1f5f9] px-3 py-2 rounded-md font-semibold disabled:opacity-50">Pop</button>
                <button onClick={handlePeek} disabled={isBusy} className="bg-[#8b5cf6] hover:opacity-90 text-[#f1f5f9] px-3 py-2 rounded-md font-semibold disabled:opacity-50">Peek</button>
                <button onClick={handleReset} disabled={isBusy} className="bg-[#ef4444] hover:opacity-90 text-[#f1f5f9] px-3 py-2 rounded-md font-semibold disabled:opacity-50">Reset</button>
              </div>
            </div>
            {message && <p className="mt-4 text-sm text-[#f59e0b] text-center">{message}</p>}
            <hr className="my-6 border-[#334155]" />
            <div>
              <h4 className="text-md font-semibold mb-3">Operation History</h4>
              <ul className="space-y-2 text-sm text-[#94a3b8]">
                {history.length > 0 ? history.map((h) => (
                  <li key={h.id} className="flex items-center gap-2">
                    {h.type === "push" ? <ArrowDownCircle className="text-[#14b8a6] w-4 h-4 flex-shrink-0" /> : <ArrowUpCircle className="text-[#ef4444] w-4 h-4 flex-shrink-0" />}
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
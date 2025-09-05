import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowDownCircle, ArrowUpCircle, ChevronLeft, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Visual Node Sub-component (Upgraded with Framer Motion & Arrows) ---
const VisualNode = ({ value, isLast, listType }) => {
  // Arrow component for connecting nodes
  const Arrow = () => {
    let arrowSymbol = "→";
    if (listType === 'doubly') arrowSymbol = "⇄";
    if (isLast && listType === 'circular') arrowSymbol = "↻";
    if (isLast && (listType === 'singly' || listType === 'doubly')) return null;

    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className={`text-2xl font-light mx-2 ${isLast && listType === 'circular' ? 'text-[#14b8a6]' : 'text-[#94a3b8]'}`}
      >
        {arrowSymbol}
      </motion.div>
    );
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="flex items-center"
    >
      <div className="bg-[#8b5cf6] text-[#f1f5f9] text-center px-4 py-3 rounded-lg font-bold text-lg shadow-lg flex-shrink-0">
        {value}
      </div>
      <Arrow />
    </motion.div>
  );
};

// --- Main Visualizer Component ---
export default function LinkedListVisualizer() {
  const [nodes, setNodes] = useState([]);
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const [listType, setListType] = useState("singly");
  const nextId = useRef(1);

  const ANIM_MS = 300;

  // --- Core Logic (Simplified for Framer Motion) ---
  const addHistory = (type, val) => {
    setHistory((prev) => [{ type, val, id: Date.now() }, ...prev.slice(0, 9)]);
  };
  const handleInsert = () => {
    if (!value.trim()) { setMessage("Enter a value to insert."); return; }
    setIsBusy(true); setMessage("");
    const id = nextId.current++;
    const node = { id, value: value.trim() };
    setNodes((prev) => [...prev, node]); // Insert at end
    addHistory("insert", node.value);
    setValue("");
    setTimeout(() => setIsBusy(false), ANIM_MS);
  };
  const handleDelete = () => {
    if (nodes.length === 0) { setMessage("List is empty — nothing to delete."); return; }
    setIsBusy(true); setMessage("");
    addHistory("delete", nodes[0].value);
    setNodes((prev) => prev.slice(1)); // Delete from front
    setTimeout(() => setIsBusy(false), ANIM_MS);
  };
  const handleReverse = () => {
    if (nodes.length < 2) { setMessage("List needs at least 2 nodes to reverse."); return; }
    setIsBusy(true); setMessage("");
    setNodes((prev) => [...prev].reverse());
    addHistory("reverse", "list");
    setTimeout(() => setIsBusy(false), ANIM_MS);
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
            <h1 className="text-2xl font-extrabold text-[#f1f5f9]">Linked List</h1>
            <p className="text-sm text-[#94a3b8]">A dynamic data structure with nodes connected by pointers.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 flex-grow min-h-0">
          
          <main className="lg:col-span-2 bg-[#0f172a] rounded-lg p-4 flex flex-col justify-center">
            <div className="w-full min-h-[150px] border-2 border-[#334155] rounded-lg flex items-center p-4 space-x-2 overflow-x-auto">
              <AnimatePresence>
                {nodes.map((node, index) => (
                  <VisualNode key={node.id} value={node.value} isLast={index === nodes.length - 1} listType={listType} />
                ))}
              </AnimatePresence>
              {nodes.length === 0 && <p className="w-full text-center text-[#94a3b8]">List is empty</p>}
            </div>
            <p className="mt-4 text-center text-lg font-semibold text-[#94a3b8]">
              {listType.charAt(0).toUpperCase() + listType.slice(1)} Linked List
            </p>
          </main>

          <aside className="h-full overflow-y-auto pr-2">
            <div>
              <h3 className="text-md font-medium text-[#94a3b8] mb-2">List Type</h3>
              <div className="grid grid-cols-3 gap-2">
                {["singly", "doubly", "circular"].map((t) => (
                  <button key={t} onClick={() => setListType(t)} className={`px-3 py-2 rounded-md font-semibold text-sm transition-colors ${listType === t ? 'bg-[#6366f1] text-[#f1f5f9]' : 'bg-[#334155] hover:bg-opacity-80'}`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <hr className="my-6 border-[#334155]" />
            
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#94a3b8]">List Size:</span>
              <code className="bg-[#0f172a] px-3 py-1 rounded-md text-lg font-bold text-[#f1f5f9]">{nodes.length}</code>
            </div>

            <hr className="my-6 border-[#334155]" />
            
            <div>
              <label className="block text-sm font-medium text-[#94a3b8]">Value</label>
              <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter a value" className="mt-1 w-full px-3 py-2 rounded-md border border-[#334155] bg-[#0f172a] text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-[#6366f1]" disabled={isBusy} />
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={handleInsert} disabled={isBusy} className="bg-[#6366f1] hover:opacity-90 text-[#f1f5f9] px-3 py-2 rounded-md font-semibold disabled:opacity-50">Insert</button>
                <button onClick={handleDelete} disabled={isBusy} className="bg-[#334155] hover:bg-opacity-80 text-[#f1f5f9] px-3 py-2 rounded-md font-semibold disabled:opacity-50">Delete</button>
                <button onClick={handleReverse} disabled={isBusy} className="bg-[#8b5cf6] hover:opacity-90 text-[#f1f5f9] px-3 py-2 rounded-md font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  <RefreshCcw size={16} /> Reverse
                </button>
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
                    {h.type === "insert" ? <ArrowDownCircle className="text-[#14b8a6] w-4 h-4 flex-shrink-0" /> : h.type === 'delete' ? <ArrowUpCircle className="text-[#ef4444] w-4 h-4 flex-shrink-0" /> : <RefreshCcw className="text-[#f59e0b] w-4 h-4 flex-shrink-0" />}
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
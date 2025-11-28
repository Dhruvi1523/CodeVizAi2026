import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Eye, RotateCcw, Settings, 
  CheckCircle, AlertCircle, Play, Zap, Star, TrendingUp 
} from 'lucide-react';

// --- Utility ---
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Code Viewer ---
const CodeViewer = ({ lines, activeLine }) => (
  <div className="bg-[#020617] p-5 rounded-xl border border-[#334155] font-mono text-sm overflow-x-auto custom-scrollbar h-auto max-h-64 shadow-inner">
    {lines.map((line, index) => (
      <div 
        key={index}
        className={`px-3 py-1.5 rounded transition-all duration-300 whitespace-nowrap ${
          activeLine === index 
            ? 'bg-[#6366f1]/20 border-l-4 border-[#6366f1] pl-2' 
            : 'opacity-60 hover:opacity-100 border-l-4 border-transparent'
        }`}
      >
        <span className="text-slate-600 select-none mr-4 w-4 inline-block text-right">{index + 1}</span>
        <span className={activeLine === index ? 'text-white font-bold' : 'text-green-400'}>
          {line}
        </span>
      </div>
    ))}
  </div>
);

export default function PriorityQueueVisualizer() {
  // --- STATE ---
  const [queue, setQueue] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [inputPriority, setInputPriority] = useState('');
  
  // UI State
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState({ text: 'Ready. Higher number = Higher priority.', type: 'info' });
  const [history, setHistory] = useState([]);
  const [codeLines, setCodeLines] = useState(["# Select an operation"]);
  const [activeLine, setActiveLine] = useState(-1);
  const [stepDescription, setStepDescription] = useState("Idle");

  const logAction = (action) => setHistory((prev) => [action, ...prev].slice(0, 6));

  // --- 1. ENQUEUE ---
  const handleEnqueue = async () => {
    if (isAnimating) return;
    if (!inputValue.trim() || !inputPriority.trim()) { 
        setMessage({ text: 'Enter both Value and Priority.', type: 'error' }); 
        return; 
    }
    
    if (queue.length >= 7) {
        setMessage({ text: 'Queue full (Max 7 for demo).', type: 'error' }); 
        return; 
    }

    const priorityVal = parseInt(inputPriority);
    const newItem = { id: Date.now(), val: inputValue, priority: priorityVal };

    setIsAnimating(true);
    setStepDescription(`Inserting "${inputValue}" with Priority ${priorityVal}...`);
    setCodeLines([
      `# Find correct position based on Priority`,
      `for i in range(len(queue)):`,
      `  if new_priority > queue[i].priority:`,
      `     insert_at(i); return`,
      `queue.append(new_item) # Lowest priority`
    ]);

    setActiveLine(0);
    await sleep(600);

    let insertIndex = queue.length;
    
    for (let i = 0; i < queue.length; i++) {
        setActiveLine(1);
        setStepDescription(`Checking index ${i}: Is ${priorityVal} > ${queue[i].priority}?`);
        await sleep(600);

        if (priorityVal > queue[i].priority) {
            setActiveLine(2);
            insertIndex = i;
            setStepDescription(`Found position! ${priorityVal} is higher than ${queue[i].priority}.`);
            await sleep(600);
            break;
        }
    }

    if (insertIndex === queue.length) {
        setActiveLine(4);
        setStepDescription("Lowest priority. Appending to end.");
    } else {
        setActiveLine(3);
    }
    await sleep(600);

    const newQueue = [...queue];
    newQueue.splice(insertIndex, 0, newItem);
    setQueue(newQueue);

    setInputValue('');
    setInputPriority('');
    setMessage({ text: `Enqueued "${inputValue}" (P:${priorityVal})`, type: 'success' });
    logAction(`Enqueue: ${inputValue} (P:${priorityVal})`);
    
    await sleep(600);
    setIsAnimating(false); 
    setActiveLine(-1); 
    setStepDescription("Idle");
  };

  // --- 2. DEQUEUE ---
  const handleDequeue = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setStepDescription("Dequeuing highest priority...");
    
    setCodeLines([
      `if queue is empty: return "Underflow"`,
      `item = queue[0] # Highest Priority is always at front`,
      `remove_at(0)`,
      `return item`
    ]);

    setActiveLine(0);
    await sleep(600);

    if (queue.length === 0) {
        setMessage({ text: 'Underflow! Queue is empty.', type: 'error' });
        await sleep(600); setIsAnimating(false); setActiveLine(-1); return;
    }

    setActiveLine(1);
    const item = queue[0];
    setStepDescription(`Selected "${item.val}" (Priority ${item.priority}).`);
    await sleep(600);

    setActiveLine(2);
    setQueue(prev => prev.slice(1)); 
    
    setMessage({ text: `Processed "${item.val}"`, type: 'success' });
    logAction(`Dequeue: ${item.val}`);
    
    await sleep(600);
    setIsAnimating(false); 
    setActiveLine(-1); 
    setStepDescription("Idle");
  };

  const handlePeek = () => {
    if (queue.length === 0) { setMessage({ text: 'Empty.', type: 'error' }); return; }
    const item = queue[0];
    setMessage({ text: `Highest Priority: "${item.val}" (P:${item.priority})`, type: 'info' });
  };

  const handleAutoFill = () => {
    if (isAnimating) return;
    if (queue.length > 0) { handleReset(); }
    
    const sampleData = [
        { id: 1, val: 'Task A', priority: 2 },
        { id: 2, val: 'Task B', priority: 8 },
        { id: 3, val: 'Task C', priority: 5 },
        { id: 4, val: 'Task D', priority: 10 }
    ];
    const sorted = [...sampleData].sort((a,b) => b.priority - a.priority);
    setQueue(sorted);
    setMessage({ text: 'Auto-filled sorted examples.', type: 'success' });
    logAction('Auto-Fill');
  };

  const handleReset = () => {
    setQueue([]);
    setHistory([]);
    setMessage({ text: 'Reset.', type: 'info' });
  };

  const getPriorityColor = (p) => {
    if (p >= 8) return 'bg-red-500 border-red-400'; 
    if (p >= 5) return 'bg-orange-500 border-orange-400'; 
    return 'bg-blue-500 border-blue-400'; 
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9] font-sans p-6 lg:p-12">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <Link 
          to="/queue" 
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e293b] border border-[#334155] hover:border-[#6366f1] transition-all text-sm font-medium text-[#94a3b8] hover:text-white"
        >
          <ArrowLeft size={18} /> 
        </Link>
        
        <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
              Priority Queue
            </h1>
            <p className="text-slate-400 text-sm">Elements are ordered by Priority (Higher First)</p>
        </div>

        <div className="w-24"></div> 
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT PANEL --- */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* VISUALIZATION STAGE */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-3xl p-8 shadow-2xl min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
            
            {/* Live Status Pill */}
            <motion.div 
              key={stepDescription}
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
              className="absolute top-6 left-0 right-0 mx-auto w-fit bg-[#0f172a]/90 backdrop-blur border border-[#6366f1]/30 px-6 py-2 rounded-full text-sm font-semibold text-[#a5a6f6] shadow-lg z-20"
            >
              {stepDescription}
            </motion.div>

            {/* QUEUE CONTAINER */}
            {/* UPDATED: Added justify-center and items-end, plus padding-bottom */}
            <div className="w-full flex justify-center items-end h-64 pb-12">
                <AnimatePresence mode='popLayout'>
                    {queue.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-slate-500 font-mono text-sm absolute"
                        >
                            Queue is Empty
                        </motion.div>
                    )}

                    {queue.map((item, index) => (
                        <motion.div
                            layout
                            key={item.id}
                            initial={{ scale: 0.5, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0, opacity: 0, y: -50 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="relative group mx-2"
                        >   
                            {/* Priority Badge */}
                            <div className={`absolute -top-4 -right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg border-2 ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                            </div>

                            {/* Node Body */}
                            <div className="w-20 h-24 bg-[#0f172a] border-2 border-[#334155] rounded-xl flex flex-col items-center justify-center shadow-lg relative overflow-hidden group-hover:border-[#6366f1] transition-colors">
                                <span className="text-lg font-bold text-slate-200 z-10">{item.val}</span>
                                <span className="text-[10px] text-slate-500 mt-2 z-10 font-mono">Idx: {index}</span>
                            </div>

                            {/* Index 0 Indicator (Fixed Position) */}
                            {index === 0 && (
                                <motion.div 
                                    layoutId="head-pointer"
                                    className="absolute -bottom-10 left-0 right-0 mx-auto flex flex-col items-center text-emerald-400"
                                >
                                    <div className="w-0.5 h-4 bg-emerald-400"></div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0f172a] px-1 rounded border border-emerald-500/30">Head</span>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            
            {/* Legend */}
            <div className="absolute bottom-4 right-6 text-[10px] text-slate-500 flex gap-4 bg-[#0f172a]/50 p-2 rounded-lg border border-[#334155]">
               <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> High (8+)</div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500 rounded-full"></div> Med (5-7)</div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Low (0-4)</div>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 shadow-lg">
             <div className="flex flex-col md:flex-row gap-4 mb-6">
                
                {/* Inputs Group */}
                <div className="flex-1 grid grid-cols-2 gap-3">
                    <input 
                      type="text" maxLength={6} 
                      value={inputValue} onChange={(e) => setInputValue(e.target.value)} 
                      placeholder="Task Name" disabled={isAnimating}
                      className="bg-[#0f172a] border border-[#334155] text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <input 
                      type="number" max={99}
                      value={inputPriority} onChange={(e) => setInputPriority(e.target.value)} 
                      placeholder="Priority (0-99)" disabled={isAnimating}
                      className="bg-[#0f172a] border border-[#334155] text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </div>

                <button 
                  onClick={handleEnqueue} disabled={isAnimating} 
                  className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={18} /> Enqueue
                </button>
             </div>
             
             {/* Operations Row */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               <button onClick={handleDequeue} disabled={isAnimating} className="px-4 py-3 bg-[#0f172a] border border-[#334155] hover:border-red-500/50 hover:text-red-400 text-slate-300 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-sm">
                  <Trash2 size={16} /> Dequeue Max
               </button>
               <button onClick={handlePeek} disabled={isAnimating} className="px-4 py-3 bg-[#0f172a] border border-[#334155] hover:border-blue-400/50 hover:text-blue-400 text-slate-300 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-sm">
                  <Eye size={16} /> Peek Max
               </button>
               <button onClick={handleAutoFill} disabled={isAnimating} className="px-4 py-3 bg-[#0f172a] border border-[#334155] hover:border-emerald-400/50 hover:text-emerald-400 text-slate-300 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-sm">
                  <Zap size={16} /> Auto Fill
               </button>
               <button onClick={handleReset} disabled={isAnimating} className="px-4 py-3 bg-[#0f172a] border border-[#334155] hover:border-yellow-500/50 hover:text-yellow-400 text-slate-300 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-sm">
                  <RotateCcw size={16} /> Reset
               </button>
             </div>
          </div>

        </div>

        {/* --- RIGHT PANEL --- */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-[#1e293b] border border-[#334155] rounded-3xl p-6 shadow-lg">
             <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
               <Play size={20} className="text-[#6366f1]" /> Insertion Sort Logic
             </h3>
             <CodeViewer lines={codeLines} activeLine={activeLine} />
             
             <AnimatePresence mode="wait">
                <motion.div 
                  key={message.text}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`mt-4 p-4 rounded-xl border text-sm font-medium flex gap-3 items-start shadow-inner
                    ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-300' : 
                      message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-300' : 
                      'bg-blue-500/10 border-blue-500/20 text-blue-200'}`}
                >
                  {message.type === 'error' ? <AlertCircle size={20} className="mt-0.5"/> : <CheckCircle size={20} className="mt-0.5"/>}
                  <span className="leading-snug">{message.text}</span>
                </motion.div>
             </AnimatePresence>
          </div>

          <div className="bg-[#1e293b] border border-[#334155] rounded-3xl p-6 flex-grow min-h-[300px] shadow-lg">
            <h3 className="text-[#94a3b8] font-bold text-sm uppercase tracking-wider mb-4 border-b border-[#334155] pb-2">Activity Log</h3>
            <ul className="space-y-3">
              <AnimatePresence>
                {history.length === 0 && <li className="text-slate-600 italic text-sm">No operations recorded.</li>}
                {history.map((log, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 text-sm text-slate-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]"></div>
                    {log}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
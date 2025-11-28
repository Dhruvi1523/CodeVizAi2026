import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, ArrowDown, Download, Upload, 
  Eye, RotateCcw, Settings, Play, Zap, CheckCircle, AlertCircle, Layers
} from 'lucide-react';

// --- CONFIG ---
const ANIMATION_SPEED = 600; 
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- COMPONENTS ---

const CodeViewer = ({ lines, activeLine }) => (
  <div className="bg-[#020617] p-4 rounded-xl border border-[#334155] font-mono text-xs md:text-sm overflow-x-auto custom-scrollbar h-48 shadow-inner">
    {lines.map((line, index) => (
      <div 
        key={index}
        className={`px-2 py-1 rounded whitespace-nowrap transition-all duration-300 ${
          activeLine === index 
            ? 'bg-[#6366f1]/20 border-l-4 border-[#6366f1] text-white font-bold pl-2' 
            : 'text-slate-500 border-l-4 border-transparent'
        }`}
      >
        {line}
      </div>
    ))}
  </div>
);

export default function StackVisualizer() {
  // --- STATE ---
  const [capacity, setCapacity] = useState(7);
  const [inputCapacity, setInputCapacity] = useState(7);
  
  // Stack Data: Array of objects { id, val }
  const [stack, setStack] = useState([]);
  const [inputValue, setInputValue] = useState('');
  
  // UI & Animation
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState({ text: 'Stack is Empty. Ready to Push.', type: 'info' });
  const [history, setHistory] = useState([]);
  const [codeLines, setCodeLines] = useState(["// Stack Operations (LIFO)"]);
  const [activeLine, setActiveLine] = useState(-1);
  const [stepDescription, setStepDescription] = useState("Idle");

  const logAction = (action) => setHistory((prev) => [action, ...prev].slice(0, 6));

  // --- ACTIONS ---

  const handleSetCapacity = () => {
    let newCap = parseInt(inputCapacity);
    if (isNaN(newCap) || newCap < 3 || newCap > 12) {
      setMessage({ text: 'Size must be 3-12.', type: 'error' });
      return;
    }
    setCapacity(newCap);
    setStack([]);
    setHistory([]);
    setMessage({ text: `Stack capacity set to ${newCap}.`, type: 'success' });
  };

  const handleAutoFill = () => {
    if (isAnimating) return;
    if (stack.length === capacity) { handleReset(); }
    
    const sampleData = [10, 20, 30, 40];
    const newItems = sampleData.slice(0, capacity).map((val, i) => ({ id: Date.now() + i, val }));
    setStack(newItems);
    setMessage({ text: 'Auto-filled stack.', type: 'success' });
    logAction('Auto-Fill');
  };

  // 1. PUSH
  const handlePush = async () => {
    if (isAnimating) return;
    if (!inputValue.trim()) { setMessage({ text: 'Enter value.', type: 'error' }); return; }
    
    setIsAnimating(true);
    setStepDescription("Pushing value...");
    setCodeLines([
      `if top == capacity - 1: return "Overflow"`,
      `top = top + 1`,
      `stack[top] = value`
    ]);

    setActiveLine(0);
    if (stack.length >= capacity) {
        setMessage({ text: 'Stack Overflow!', type: 'error' });
        await sleep(ANIMATION_SPEED);
        setIsAnimating(false); setActiveLine(-1);
        return;
    }
    await sleep(ANIMATION_SPEED);

    setActiveLine(1);
    setStepDescription("Incrementing Top...");
    await sleep(ANIMATION_SPEED);

    setActiveLine(2);
    const newItem = { id: Date.now(), val: inputValue };
    setStack([...stack, newItem]);
    
    setMessage({ text: `Pushed "${inputValue}" to Top.`, type: 'success' });
    logAction(`Push: ${inputValue}`);
    setInputValue('');

    await sleep(ANIMATION_SPEED);
    setIsAnimating(false); setActiveLine(-1); setStepDescription("Idle");
  };

  // 2. POP
  const handlePop = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setStepDescription("Popping value...");
    setCodeLines([
      `if top == -1: return "Underflow"`,
      `value = stack[top]`,
      `top = top - 1`,
      `return value`
    ]);

    setActiveLine(0);
    if (stack.length === 0) {
        setMessage({ text: 'Stack Underflow!', type: 'error' });
        await sleep(ANIMATION_SPEED);
        setIsAnimating(false); setActiveLine(-1);
        return;
    }
    await sleep(ANIMATION_SPEED);

    setActiveLine(1);
    const poppedItem = stack[stack.length - 1];
    setStepDescription(`Removing Top element "${poppedItem.val}"...`);
    await sleep(ANIMATION_SPEED);

    setActiveLine(2);
    const newStack = stack.slice(0, -1);
    setStack(newStack);
    
    setActiveLine(3);
    setMessage({ text: `Popped "${poppedItem.val}".`, type: 'success' });
    logAction(`Pop: ${poppedItem.val}`);

    await sleep(ANIMATION_SPEED);
    setIsAnimating(false); setActiveLine(-1); setStepDescription("Idle");
  };

  // 3. PEEK
  const handlePeek = () => {
    if (stack.length === 0) { setMessage({ text: 'Stack is Empty.', type: 'error' }); return; }
    setMessage({ text: `Top Value: ${stack[stack.length - 1].val}`, type: 'info' });
  };

  const handleReset = () => {
    setStack([]);
    setHistory([]);
    setMessage({ text: 'Stack Cleared.', type: 'info' });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9] font-sans p-4 md:p-8">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link to="/dsa-visualizer" className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] border border-[#334155] rounded-xl hover:border-[#6366f1] transition text-sm text-slate-400 hover:text-white">
          <ArrowLeft size={16} />
        </Link>
        <div className="text-center">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">
              Stack Visualizer
            </h1>
            <p className="text-xs text-slate-500 mt-1">LIFO: Last In, First Out</p>
        </div>
        <div className="flex items-center gap-3 bg-[#1e293b] p-2 rounded-xl border border-[#334155]">
           <Settings size={18} className="text-slate-400 ml-1" />
           <input 
             type="number" min="3" max="12"
             value={inputCapacity} onChange={(e) => setInputCapacity(e.target.value)}
             className="w-14 bg-[#0f172a] text-white border border-[#334155] rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-[#6366f1]"
           />
           <button onClick={handleSetCapacity} className="bg-[#6366f1] hover:bg-[#5457e5] px-4 py-1.5 rounded-lg text-white text-sm font-bold transition-colors">
             Set
           </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- LEFT: VISUALIZER (8 Cols) --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STAGE: Vertical Bucket */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 min-h-[450px] flex flex-col relative overflow-hidden shadow-2xl items-center justify-center">
            
            {/* Live Message */}
            <div className="absolute top-4 left-0 right-0 mx-auto w-fit z-20">
               <motion.span 
                 key={message.text}
                 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                 className={`px-4 py-1.5 rounded-full border text-xs font-mono font-bold flex items-center gap-2
                    ${message.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' : 
                      message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 
                      'bg-blue-500/10 border-blue-500/50 text-blue-400'}`}
               >
                 {message.type === 'error' ? <AlertCircle size={14}/> : <CheckCircle size={14}/>}
                 {message.text}
               </motion.span>
            </div>

            <div className="absolute top-4 left-4 text-xs font-mono text-slate-500">
               Size: {stack.length} / {capacity}
            </div>

            {/* STACK CONTAINER (BUCKET) */}
            <div className="relative mt-8">
                {/* The "Bucket" Border */}
                <div 
                    className="border-l-4 border-r-4 border-b-4 border-slate-600 rounded-b-xl bg-[#0f172a]/50 relative"
                    style={{ 
                        width: '180px', 
                        height: `${capacity * 50 + 20}px` // Dynamic height based on capacity
                    }} 
                >
                    {/* Grid Lines (Optional Guide) */}
                    <div className="absolute inset-0 flex flex-col-reverse justify-start p-2 gap-2 opacity-20 pointer-events-none">
                        {Array.from({ length: capacity }).map((_, i) => (
                            <div key={i} className="w-full h-10 border border-dashed border-slate-400 rounded"></div>
                        ))}
                    </div>

                    {/* Stack Items (Flex Col Reverse for bottom-up) */}
                    <div className="absolute inset-0 flex flex-col-reverse justify-start p-2 gap-2">
                        <AnimatePresence>
                            {stack.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: -200, scale: 0.8 }} // Drop from top
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -200, scale: 0.5 }} // Fly out to top
                                    transition={{ type: "spring", stiffness: 120, damping: 15 }}
                                    className="w-full h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md flex items-center justify-center text-white font-bold shadow-lg border border-blue-400/50 relative group"
                                >
                                    {item.val}
                                    
                                    {/* Index Label on Left */}
                                    <div className="absolute -left-12 text-slate-500 text-xs font-mono opacity-50 group-hover:opacity-100">
                                        {index}
                                    </div>

                                    {/* TOP Pointer (Only for last item) */}
                                    {index === stack.length - 1 && (
                                        <motion.div 
                                            layoutId="top-pointer"
                                            className="absolute -right-24 flex items-center gap-2 text-yellow-400 font-bold text-xs"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                        >
                                            <ArrowLeft size={20} /> TOP
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

          </div>

          {/* CONTROLS */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6">
            <div className="flex gap-3 mb-6">
              <input 
                value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                placeholder="Value" disabled={isAnimating}
                className="flex-1 bg-[#0f172a] border border-[#334155] text-white px-4 py-2.5 rounded-xl text-sm focus:border-violet-500 outline-none transition-colors"
              />
              <button onClick={handleAutoFill} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-violet-600/20 text-violet-400 border border-violet-600/50 hover:bg-violet-600/30 px-6 py-2.5 rounded-xl text-xs font-bold transition-all">
                <Zap size={14} /> Auto
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button onClick={handlePush} disabled={isAnimating || stack.length === capacity} className="flex items-center justify-center gap-2 bg-emerald-600/20 text-emerald-400 border border-emerald-600/50 hover:bg-emerald-600/30 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                <Download size={16} /> PUSH
              </button>
              <button onClick={handlePop} disabled={isAnimating || stack.length === 0} className="flex items-center justify-center gap-2 bg-red-600/10 text-red-400 border border-red-600/30 hover:bg-red-600/20 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                <Upload size={16} /> POP
              </button>
              <button onClick={handlePeek} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-blue-600/20 text-blue-400 border border-blue-600/50 hover:bg-blue-600/30 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                <Eye size={16} /> PEEK
              </button>
            </div>
            
            <button onClick={handleReset} disabled={isAnimating} className="w-full mt-3 py-2 bg-slate-700/30 text-slate-400 border border-slate-600/50 hover:bg-slate-700/50 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
               <RotateCcw size={14} className="inline mr-2" /> Reset Stack
            </button>
          </div>
        </div>

        {/* --- RIGHT: CODE (4 Cols) --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 h-full shadow-lg">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-white font-bold flex items-center gap-2 text-lg"><Play size={20} className="text-violet-400"/> Logic</h3>
               <span className="text-[10px] bg-[#0f172a] px-2 py-1 rounded text-slate-500">Mode: LIFO</span>
            </div>
            
            <CodeViewer lines={codeLines} activeLine={activeLine} />
            
            <div className="mt-6 p-4 bg-[#0f172a] rounded-xl border border-[#334155]">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3 border-b border-[#334155] pb-2">Properties</h4>
              <ul className="text-[10px] text-violet-400 space-y-2 font-mono">
                  <li className="flex justify-between"><span>Push:</span> <span className="text-white">O(1)</span></li>
                  <li className="flex justify-between"><span>Pop:</span> <span className="text-white">O(1)</span></li>
                  <li className="flex justify-between"><span>Top Access:</span> <span className="text-white">O(1)</span></li>
              </ul>
            </div>

            {/* History */}
            <div className="mt-6 border-t border-[#334155] pt-4">
               <h3 className="text-slate-400 text-xs font-bold uppercase mb-3">Recent History</h3>
               <ul className="space-y-2">
                  <AnimatePresence>
                    {history.length === 0 && <li className="text-slate-600 italic text-xs">No operations.</li>}
                    {history.map((log, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-xs text-slate-300 font-mono"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div> {log}
                      </motion.li>
                    ))}
                  </AnimatePresence>
               </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
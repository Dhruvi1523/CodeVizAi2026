import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, RotateCcw, Settings, 
  CheckCircle, AlertCircle, Play, Zap, ArrowRight, Link as LinkIcon
} from 'lucide-react';

// --- CONFIG ---
const ANIMATION_SPEED = 600;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- COMPONENTS ---

const MathViewer = ({ formula, result }) => (
  <div className="bg-[#020617] p-6 rounded-2xl border border-[#334155] flex flex-col items-center justify-center h-40 shadow-inner">
    <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Hash Function</div>
    <div className="text-2xl font-mono text-white font-bold flex items-center gap-3">
      <span className="opacity-80">h(k) = </span>
      {formula ? (
        <motion.span 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          key={formula}
          className="text-violet-400"
        >
          {formula}
        </motion.span>
      ) : (
        <span className="text-slate-700">k % size</span>
      )}
    </div>
    {result !== null && (
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mt-3 bg-[#1e293b] px-4 py-1 rounded-full border border-violet-500/50 text-violet-300 font-mono text-sm"
      >
        Bucket Index: {result}
      </motion.div>
    )}
  </div>
);

// Individual Node in the Chain
const ChainNode = ({ val, index }) => (
  <motion.div
    layout
    initial={{ scale: 0, x: -20 }}
    animate={{ scale: 1, x: 0 }}
    exit={{ scale: 0, opacity: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    className="flex items-center"
  >
    {/* Arrow Connection */}
    <div className="text-slate-600 px-1">
      <ArrowRight size={16} />
    </div>

    {/* The Node */}
    <div className="w-12 h-12 bg-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md border border-violet-400 relative group cursor-pointer hover:bg-violet-500 transition-colors">
        {val}
        <div className="absolute -bottom-4 text-[8px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
            Node {index}
        </div>
    </div>
  </motion.div>
);

export default function SeparateChaining() {
  // --- STATE ---
  const [size, setSize] = useState(7); // Smaller size to fit vertical layout better
  // Table is array of arrays: [[10, 24], [5], [], ...]
  const [table, setTable] = useState(Array(7).fill([])); 
  const [inputValue, setInputValue] = useState('');
  
  // Animation
  const [activeBucket, setActiveBucket] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState('Ready. Enter a number.');
  const [mathState, setMathState] = useState({ formula: null, result: null });
  const [stepDescription, setStepDescription] = useState("Idle");

  // --- OPERATIONS ---

  const handleResize = () => {
    const newSize = size === 7 ? 5 : 7;
    setSize(newSize);
    setTable(Array(newSize).fill([]));
    setMessage(`Table resized to ${newSize}.`);
    setMathState({ formula: null, result: null });
    setActiveBucket(-1);
  };

  const handleInsert = async () => {
    if (isAnimating) return;
    const val = parseInt(inputValue);
    if (isNaN(val)) { setMessage("Enter a valid number."); return; }
    
    setIsAnimating(true);
    setStepDescription(`Hashing ${val}...`);
    
    // 1. Calculate Hash
    const index = val % size;
    setMathState({ formula: `${val} % ${size}`, result: index });
    setMessage(`Target Bucket: ${index}`);
    
    await sleep(ANIMATION_SPEED);

    // 2. Highlight Bucket
    setActiveBucket(index);
    setStepDescription(`Traversing to Bucket ${index}...`);
    await sleep(ANIMATION_SPEED);

    // 3. Insert into Chain
    const newTable = [...table];
    // Check if duplicate exists (optional logic, usually sets allow unique, here we allow duplicates for viz)
    
    setStepDescription("Appending to Chain...");
    // We create a new array ref to trigger re-render properly
    newTable[index] = [...newTable[index], val]; 
    
    setTable(newTable);
    setMessage(`Inserted ${val} into Bucket ${index}.`);
    setInputValue('');
    
    await sleep(ANIMATION_SPEED);
    setActiveBucket(-1);
    setIsAnimating(false);
    setStepDescription("Idle");
  };

  const handleAutoFill = async () => {
    if (isAnimating) return;
    setTable(Array(size).fill([]));
    await sleep(200);

    // Create clustering scenarios
    // For size 7: 7, 14, 21 -> Bucket 0
    // 8, 15 -> Bucket 1
    const demoData = [7, 14, 21, 8, 15, 3]; 
    const newTable = Array(size).fill([]).map(() => []);
    
    demoData.forEach(val => {
        const idx = val % size;
        newTable[idx].push(val);
    });

    setTable(newTable);
    setMessage("Auto-filled with chains.");
  };

  const handleClear = () => {
    setTable(Array(size).fill([]));
    setMessage("Table cleared.");
    setActiveBucket(-1);
    setMathState({ formula: null, result: null });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9] font-sans p-4 md:p-8">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link to="/hashing" className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] border border-[#334155] rounded-xl hover:border-[#6366f1] transition text-sm text-slate-400 hover:text-white">
          <ArrowLeft size={16} /> 
        </Link>
        <div className="text-center">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-500">
              Separate Chaining
            </h1>
            <p className="text-xs text-slate-500 mt-1">Collision Resolution: Linked List at each Bucket</p>
        </div>
        <div className="flex items-center gap-3 bg-[#1e293b] p-2 rounded-xl border border-[#334155]">
           <Settings size={18} className="text-slate-400 ml-1" />
           <span className="text-xs text-slate-300 font-mono">Size: {size}</span>
           <button onClick={handleResize} className="bg-[#6366f1] hover:bg-[#5457e5] px-3 py-1 rounded-lg text-white text-xs font-bold transition-colors">
             Change
           </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- LEFT PANEL: CONTROLS & MATH --- */}
        <div className="lg:col-span-4 space-y-6">
          
          <MathViewer formula={mathState.formula} result={mathState.result} />

          {/* CONTROLS */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 shadow-lg">
            <div className="space-y-4">
              <input 
                type="number"
                value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter Number" disabled={isAnimating}
                className="w-full bg-[#0f172a] border border-[#334155] text-white px-4 py-3 rounded-xl text-lg focus:border-violet-500 outline-none transition-colors text-center font-mono"
              />
              
              <button 
                onClick={handleInsert} disabled={isAnimating} 
                className="w-full bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Hash It
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleAutoFill} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-50">
                    <Zap size={16} /> Fill
                </button>
                <button onClick={handleClear} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-[#0f172a] border border-[#334155] hover:border-red-500/50 hover:text-red-400 text-slate-300 px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-50">
                    <Trash2 size={16} /> Clear
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b]/50 border border-[#334155] rounded-2xl p-4">
             <div className="flex items-start gap-3">
                <LinkIcon className="text-emerald-500 shrink-0 mt-1" size={20} />
                <div className="text-xs text-slate-400 leading-relaxed">
                   <strong className="text-slate-200 block mb-1">Chaining Concept</strong>
                   Each bucket is independent. If a collision occurs, we simply append the new item to the end of that bucket's <strong>Linked List</strong>.
                </div>
             </div>
          </div>

        </div>

        {/* --- RIGHT PANEL: VISUALIZER --- */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-[#1e293b] border border-[#334155] rounded-3xl p-8 shadow-2xl min-h-[500px] flex flex-col relative">
            
            {/* Live Message */}
            <div className="absolute top-4 right-4 z-20">
               <motion.span 
                 key={stepDescription}
                 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                 className="bg-[#0f172a]/90 px-4 py-1.5 rounded-full border border-[#6366f1]/30 text-xs font-mono text-[#a5a6f6]"
               >
                 {stepDescription}
               </motion.span>
            </div>

            {/* HASH TABLE STAGE */}
            <div className="flex-1 mt-8">
               <div className="flex flex-col gap-3">
                  {table.map((chain, bucketIndex) => {
                      const isActive = activeBucket === bucketIndex;
                      
                      return (
                          <div key={bucketIndex} className="flex items-center h-16">
                              
                              {/* Bucket / Index Box */}
                              <motion.div 
                                animate={{ 
                                    scale: isActive ? 1.1 : 1,
                                    borderColor: isActive ? '#8b5cf6' : '#334155',
                                    backgroundColor: isActive ? '#2e1065' : '#0f172a'
                                }}
                                className="w-16 h-14 rounded-l-xl border-2 flex flex-col items-center justify-center shrink-0 z-10 shadow-lg"
                              >
                                  <span className={`text-lg font-bold ${isActive ? 'text-violet-300' : 'text-slate-500'}`}>
                                      {bucketIndex}
                                  </span>
                              </motion.div>

                              {/* The Chain (Linked List) */}
                              <div className="flex-1 h-full border-b border-[#334155]/50 flex items-center pl-2 overflow-x-auto custom-scrollbar">
                                  <AnimatePresence>
                                      {chain.length === 0 ? (
                                          <span className="text-slate-700 font-mono text-xs ml-2">NULL</span>
                                      ) : (
                                          chain.map((val, nodeIndex) => (
                                              <ChainNode key={`${bucketIndex}-${nodeIndex}`} val={val} index={nodeIndex} />
                                          ))
                                      )}
                                  </AnimatePresence>
                              </div>

                          </div>
                      );
                  })}
               </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
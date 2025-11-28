import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, RotateCcw, Settings, 
  CheckCircle, AlertCircle, Play, Zap, Hash
} from 'lucide-react';

// --- CONFIG ---
const ANIMATION_SPEED = 600;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- HELPER COMPONENT: CODE/MATH DISPLAY ---
const MathViewer = ({ formula, result }) => (
  <div className="bg-[#020617] p-6 rounded-2xl border border-[#334155] flex flex-col items-center justify-center h-48 shadow-inner">
    <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Hash Function</div>
    <div className="text-2xl md:text-3xl font-mono text-white font-bold flex items-center gap-3">
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
        className="mt-4 bg-[#1e293b] px-4 py-1 rounded-full border border-violet-500/50 text-violet-300 font-mono text-lg"
      >
        Index: {result}
      </motion.div>
    )}
  </div>
);

export default function SimpleHashing() {
  // --- STATE ---
  const [size, setSize] = useState(10);
  const [table, setTable] = useState(Array(10).fill(null));
  const [inputValue, setInputValue] = useState('');
  
  // Animation State
  const [activeIndices, setActiveIndices] = useState({ current: -1, collision: -1 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState('Ready. Enter a number to hash.');
  const [mathState, setMathState] = useState({ formula: null, result: null });
  const [stepDescription, setStepDescription] = useState("Idle");

  // --- OPERATIONS ---

  const handleResize = () => {
    // Toggle sizes for demo
    const newSize = size === 10 ? 7 : 10;
    setSize(newSize);
    setTable(Array(newSize).fill(null));
    setMessage(`Table resized to ${newSize}.`);
    setMathState({ formula: null, result: null });
    setActiveIndices({ current: -1, collision: -1 });
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
    setMessage(`Calculated Index: ${index}`);
    
    await sleep(ANIMATION_SPEED);

    // 2. Check Collision
    if (table[index] !== null) {
        // Collision!
        setActiveIndices({ current: -1, collision: index });
        setMessage(`Collision! Index ${index} is occupied by ${table[index]}.`);
        setStepDescription("Insertion Failed");
        
        await sleep(1000);
    } else {
        // Insert
        setActiveIndices({ current: index, collision: -1 });
        const newTable = [...table];
        newTable[index] = val;
        setTable(newTable);
        setMessage(`Inserted ${val} at Index ${index}.`);
        setStepDescription("Success");
        setInputValue('');
        
        await sleep(ANIMATION_SPEED);
    }

    setActiveIndices({ current: -1, collision: -1 });
    setIsAnimating(false);
  };

  const handleAutoFill = async () => {
    if (isAnimating) return;
    // Fill random spots
    const newTable = [...table];
    let added = 0;
    for(let i=0; i<3; i++) {
        const rnd = Math.floor(Math.random() * 100);
        const idx = rnd % size;
        if(newTable[idx] === null) {
            newTable[idx] = rnd;
            added++;
        }
    }
    setTable(newTable);
    setMessage(`Randomly added ${added} elements.`);
  };

  const handleClear = () => {
    setTable(Array(size).fill(null));
    setMessage("Table cleared.");
    setActiveIndices({ current: -1, collision: -1 });
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
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-500">
              Simple Hashing
            </h1>
            <p className="text-xs text-slate-500 mt-1">Direct Mapping: Index = Key % Size</p>
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
          
          {/* MATH VIEWER */}
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

          {/* INFO CARD */}
          <div className="bg-[#1e293b]/50 border border-[#334155] rounded-2xl p-4">
             <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-500 shrink-0 mt-1" size={20} />
                <div className="text-xs text-slate-400 leading-relaxed">
                   <strong className="text-slate-200 block mb-1">Collision Warning</strong>
                   In Simple Hashing, if two keys map to the same index, we have a <strong>Collision</strong>. Real applications use Linear Probing or Chaining to fix this.
                </div>
             </div>
          </div>

        </div>

        {/* --- RIGHT PANEL: VISUALIZER --- */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-[#1e293b] border border-[#334155] rounded-3xl p-8 shadow-2xl min-h-[500px] flex flex-col relative overflow-hidden">
            
            {/* Live Message */}
            <div className="absolute top-6 left-0 right-0 mx-auto w-fit z-20">
               <motion.span 
                 key={stepDescription}
                 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                 className={`px-4 py-1.5 rounded-full border text-xs font-mono text-white shadow-lg
                    ${message.includes('Collision') ? 'bg-red-500/20 border-red-500' : 'bg-[#0f172a]/90 border-[#6366f1]/30 text-[#a5a6f6]'}`}
               >
                 {message}
               </motion.span>
            </div>

            {/* HASH TABLE GRID */}
            <div className="flex-1 flex items-center justify-center">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
                <AnimatePresence>
                    {table.map((val, index) => {
                        const isCurrent = activeIndices.current === index;
                        const isCollision = activeIndices.collision === index;
                        
                        return (
                            <motion.div
                                key={index}
                                layout
                                animate={{ 
                                    scale: isCurrent || isCollision ? 1.1 : 1,
                                    x: isCollision ? [0, -5, 5, -5, 5, 0] : 0 // Shake effect
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className={`
                                    relative h-24 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-300 shadow-lg
                                    ${isCollision 
                                        ? 'bg-red-500/20 border-red-500 text-red-200 z-10' 
                                        : isCurrent 
                                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 z-10'
                                            : val !== null 
                                                ? 'bg-[#6366f1]/20 border-[#6366f1] text-white'
                                                : 'bg-[#0f172a] border-[#334155] text-slate-600'
                                    }
                                `}
                            >
                                <span className="text-2xl font-bold z-10">{val !== null ? val : ''}</span>
                                
                                {/* Index Badge */}
                                <div className={`absolute -bottom-3 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0f172a] border ${isCurrent ? 'border-emerald-400 text-emerald-400' : 'border-[#334155] text-slate-500'}`}>
                                    {index}
                                </div>

                                {/* Hash Icon for Empty */}
                                {val === null && <Hash size={24} className="opacity-10 absolute" />}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
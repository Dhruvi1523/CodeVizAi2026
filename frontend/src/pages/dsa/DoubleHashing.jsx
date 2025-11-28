import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, RotateCcw, Settings, 
  CheckCircle, AlertCircle, Play, Calculator, Hash, Search 
} from 'lucide-react';

// --- CONFIG ---
const ANIMATION_SPEED = 800;
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

export default function DoubleHashing() {
  // --- STATE ---
  const [size, setSize] = useState(11); // Default Prime
  const [table, setTable] = useState(Array(11).fill(null));
  const [inputValue, setInputValue] = useState('');
  
  // Animation State
  const [activeIndices, setActiveIndices] = useState({ current: -1, collision: -1 }); // Highlights
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState('Ready to hash.');
  const [codeLines, setCodeLines] = useState(["// Double Hashing Logic"]);
  const [activeLine, setActiveLine] = useState(-1);
  const [stepDescription, setStepDescription] = useState("Idle");
  
  // Stats
  const [calcData, setCalcData] = useState({ h1: '?', h2: '?', probe: '?' });

  // --- LOGIC ---
  
  // Hashing Functions
  const h1 = (key, tableSize) => key % tableSize;
  const h2 = (key, tableSize) => 1 + (key % (tableSize - 1));

  // --- OPERATIONS ---

  const handleResize = () => {
    // Simple toggle between sizes for demo (primes)
    const newSize = size === 11 ? 17 : 11;
    setSize(newSize);
    setTable(Array(newSize).fill(null));
    setMessage(`Table resized to ${newSize} (Prime).`);
    setActiveIndices({ current: -1, collision: -1 });
    setCalcData({ h1: '?', h2: '?', probe: '?' });
  };

  const handleInsert = async () => {
    if (isAnimating) return;
    const val = parseInt(inputValue);
    if (isNaN(val)) { setMessage("Enter a valid number."); return; }
    
    setIsAnimating(true);
    setStepDescription(`Inserting ${val}...`);
    setCodeLines([
      `idx = h1(k) = k % size`,
      `step = h2(k) = 1 + (k % (size - 1))`,
      `while table[idx] is occupied:`,
      `    idx = (idx + step) % size  # Probe`,
      `table[idx] = k`
    ]);

    // 1. Calculate H1
    setActiveLine(0);
    const stepSize = h2(val, size);
    let currIndex = h1(val, size);
    
    setCalcData({ 
        h1: `${val} % ${size} = ${currIndex}`, 
        h2: `1 + (${val} % ${size-1}) = ${stepSize}`,
        probe: '0'
    });
    
    setMessage(`Calculated Start Index: ${currIndex}`);
    setActiveIndices({ current: currIndex, collision: -1 });
    await sleep(ANIMATION_SPEED);

    // 2. Calculate H2 (Step)
    setActiveLine(1);
    setMessage(`Calculated Step Size (H2): ${stepSize}`);
    await sleep(ANIMATION_SPEED);

    // 3. Probing Loop
    let probes = 0;
    while (table[currIndex] !== null && probes < size) {
        // Highlight Collision
        setActiveLine(2);
        setActiveIndices({ current: currIndex, collision: currIndex });
        setMessage(`Collision at index ${currIndex}! Value: ${table[currIndex]}`);
        await sleep(ANIMATION_SPEED);

        // Calculate Next Probe
        setActiveLine(3);
        const oldIndex = currIndex;
        currIndex = (currIndex + stepSize) % size;
        probes++;
        
        setCalcData(prev => ({ ...prev, probe: probes.toString() }));
        setStepDescription(`Probe ${probes}: (${oldIndex} + ${stepSize}) % ${size} = ${currIndex}`);
        setActiveIndices({ current: currIndex, collision: -1 });
        await sleep(ANIMATION_SPEED);
    }

    if (probes >= size) {
        setMessage("Table is full or loop detected!");
        setActiveIndices({ current: -1, collision: -1 });
        setIsAnimating(false);
        return;
    }

    // 4. Insert
    setActiveLine(4);
    const newTable = [...table];
    newTable[currIndex] = val;
    setTable(newTable);
    setMessage(`Inserted ${val} at Index ${currIndex}`);
    setStepDescription("Success");
    setInputValue('');
    
    await sleep(ANIMATION_SPEED);
    setActiveIndices({ current: -1, collision: -1 });
    setIsAnimating(false);
    setActiveLine(-1);
  };

  const handleClear = () => {
    setTable(Array(size).fill(null));
    setMessage("Table cleared.");
    setActiveIndices({ current: -1, collision: -1 });
    setCalcData({ h1: '?', h2: '?', probe: '?' });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9] font-sans p-4 md:p-8">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link to="/hashing" className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] border border-[#334155] rounded-xl hover:border-[#6366f1] transition text-sm text-slate-400 hover:text-white">
          <ArrowLeft size={16} />
        </Link>
        <div className="text-center">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">
              Double Hashing
            </h1>
            <p className="text-xs text-slate-500 mt-1">Collision Resolution: Index = (H1 + i*H2) % Size</p>
        </div>
        <div className="flex items-center gap-3 bg-[#1e293b] p-2 rounded-xl border border-[#334155]">
           <Settings size={18} className="text-slate-400 ml-1" />
           <span className="text-xs text-slate-300 font-mono">Size: {size}</span>
           <button onClick={handleResize} className="bg-[#6366f1] hover:bg-[#5457e5] px-3 py-1 rounded-lg text-white text-xs font-bold transition-colors">
             Change
           </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- LEFT: VISUALIZER --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* FORMULA DASHBOARD */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-4 flex flex-wrap gap-4 justify-around shadow-md">
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Primary Hash (H1)</span>
                <span className="text-lg font-mono text-emerald-400 font-bold">{calcData.h1}</span>
                <span className="text-[10px] text-slate-600">k % size</span>
             </div>
             <div className="w-[1px] bg-[#334155] hidden md:block"></div>
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Step Hash (H2)</span>
                <span className="text-lg font-mono text-blue-400 font-bold">{calcData.h2}</span>
                <span className="text-[10px] text-slate-600">1 + (k % (size-1))</span>
             </div>
             <div className="w-[1px] bg-[#334155] hidden md:block"></div>
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Probe Count (i)</span>
                <span className="text-lg font-mono text-orange-400 font-bold">{calcData.probe}</span>
             </div>
          </div>

          {/* VISUALIZATION STAGE */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-3xl p-8 shadow-2xl min-h-[300px] flex flex-col relative overflow-hidden">
            
            {/* Live Message */}
            <div className="absolute top-4 left-0 right-0 mx-auto w-fit z-20">
               <motion.span 
                 key={stepDescription}
                 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                 className="bg-[#0f172a]/90 px-4 py-1.5 rounded-full border border-[#6366f1]/30 text-xs font-mono text-[#a5a6f6]"
               >
                 {stepDescription}
               </motion.span>
            </div>

            {/* HASH TABLE GRID */}
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              <AnimatePresence>
                {table.map((val, index) => {
                    const isCurrent = activeIndices.current === index;
                    const isCollision = activeIndices.collision === index;
                    
                    return (
                        <motion.div
                            key={index}
                            layout
                            className={`
                                relative w-16 h-20 rounded-xl flex flex-col items-center justify-center border-2 transition-all duration-300 shadow-lg
                                ${isCollision 
                                    ? 'bg-red-500/20 border-red-500 text-red-200 scale-110 z-10' 
                                    : isCurrent 
                                        ? 'bg-yellow-500/20 border-yellow-400 text-yellow-200 scale-110 z-10'
                                        : val !== null 
                                            ? 'bg-[#6366f1]/20 border-[#6366f1] text-white'
                                            : 'bg-[#0f172a] border-[#334155] text-slate-600'
                                }
                            `}
                        >
                            <span className="text-lg font-bold z-10">{val !== null ? val : ''}</span>
                            
                            {/* Index Label */}
                            <div className={`absolute -bottom-6 text-xs font-mono font-bold ${isCurrent ? 'text-yellow-400' : 'text-slate-500'}`}>
                                {index}
                            </div>

                            {/* Pointer Arrow */}
                            {isCurrent && (
                                <motion.div 
                                    initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                    className="absolute -top-8 text-yellow-400"
                                >
                                    <div className="text-[10px] font-bold">Probe</div>
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6">
            <div className="flex gap-3">
              <input 
                type="number"
                value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter Number" disabled={isAnimating}
                className="flex-1 bg-[#0f172a] border border-[#334155] text-white px-4 py-3 rounded-xl text-sm focus:border-violet-500 outline-none transition-colors"
              />
              <button onClick={handleInsert} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20">
                <Plus size={18} /> Insert
              </button>
              <button onClick={handleClear} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-[#0f172a] border border-[#334155] hover:border-red-500/50 hover:text-red-400 text-slate-300 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50">
                <Trash2 size={18} /> Clear
              </button>
            </div>
          </div>
        </div>

        {/* --- RIGHT: CODE & LOGS --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 shadow-lg">
             <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
               <Play size={16} className="text-violet-400"/> Execution Trace
             </h3>
             <CodeViewer lines={codeLines} activeLine={activeLine} />
             
             <AnimatePresence mode="wait">
                <motion.div 
                  key={message}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`mt-4 p-3 rounded-lg border text-xs md:text-sm font-medium flex gap-2 items-start
                    ${message.includes('Collision') || message.includes('valid') ? 'bg-red-500/10 border-red-500/20 text-red-200' : 
                      message.includes('Inserted') ? 'bg-green-500/10 border-green-500/20 text-green-200' : 
                      'bg-blue-500/10 border-blue-500/20 text-blue-200'}`}
                >
                  {message.includes('Collision') ? <AlertCircle size={16} className="mt-0.5 shrink-0"/> : <CheckCircle size={16} className="mt-0.5 shrink-0"/>}
                  {message}
                </motion.div>
             </AnimatePresence>
          </div>

          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6">
            <h3 className="text-[#94a3b8] font-bold text-xs uppercase tracking-wider mb-4 border-b border-[#334155] pb-2">Math Helper</h3>
            <div className="space-y-3">
                <div className="text-xs text-slate-400">
                    <span className="text-emerald-400 font-bold">H1(k) = k % size</span>
                    <p className="opacity-60 mt-1">Determines the initial starting index.</p>
                </div>
                <div className="text-xs text-slate-400">
                    <span className="text-blue-400 font-bold">H2(k) = 1 + (k % (size - 1))</span>
                    <p className="opacity-60 mt-1">Determines the jump size on collision. Must be non-zero.</p>
                </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
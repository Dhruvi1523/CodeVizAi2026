import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, RotateCcw, Settings, 
  CheckCircle, AlertCircle, Play, ArrowDown, ArrowUp 
} from 'lucide-react';

// --- Utility ---
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Sub-Component: Spacious Code Viewer ---
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

export default function DequeVisualizer() {
  // --- STATE ---
  const [capacity, setCapacity] = useState(8);
  const [inputCapacity, setInputCapacity] = useState(8);
  const [deque, setDeque] = useState(Array(8).fill(null));
  
  // Pointers: -1 indicates empty
  const [front, setFront] = useState(-1);
  const [rear, setRear] = useState(-1);
  const [inputValue, setInputValue] = useState('');

  // UI State
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState({ text: 'Ready. Use controls below.', type: 'info' });
  const [history, setHistory] = useState([]);
  const [codeLines, setCodeLines] = useState(["# Select an operation"]);
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
    setDeque(Array(newCap).fill(null));
    setFront(-1);
    setRear(-1);
    setHistory([]);
    setMessage({ text: `Deque resized to ${newCap}.`, type: 'success' });
  };

  // --- 1. INSERT FRONT ---
  const insertFront = async () => {
    if (isAnimating) return;
    if (!inputValue.trim()) { setMessage({ text: 'Enter value.', type: 'error' }); return; }

    setIsAnimating(true);
    setStepDescription("Operation: Insert Front");
    setCodeLines([
      `if (front == 0 && rear == n-1) || (front == rear + 1): Overflow`,
      `if front == -1: front = 0; rear = 0`,
      `else if front == 0: front = n - 1`,
      `else: front = front - 1`,
      `deque[front] = item`
    ]);

    setActiveLine(0);
    // Check Full
    if ((front === 0 && rear === capacity - 1) || (front === rear + 1)) {
        setMessage({ text: 'Overflow! Deque is full.', type: 'error' });
        await sleep(800); setIsAnimating(false); setActiveLine(-1); return;
    }
    await sleep(600);

    let nextFront;
    if (front === -1) {
        setActiveLine(1);
        nextFront = 0;
        setRear(0);
        setStepDescription("Empty Deque: Init pointers to 0.");
    } else if (front === 0) {
        setActiveLine(2);
        nextFront = capacity - 1; // Wrap around
        setStepDescription("Front at start: Wrapping to end (Circular).");
    } else {
        setActiveLine(3);
        nextFront = front - 1;
        setStepDescription("Decrementing Front index.");
    }
    setFront(nextFront);
    await sleep(800);

    setActiveLine(4);
    const newDeque = [...deque];
    newDeque[nextFront] = inputValue;
    setDeque(newDeque);
    
    setInputValue('');
    setMessage({ text: `Inserted "${inputValue}" at Front (${nextFront})`, type: 'success' });
    logAction(`Insert Front: ${inputValue}`);
    await sleep(800); setIsAnimating(false); setActiveLine(-1); setStepDescription("Idle");
  };

  // --- 2. INSERT REAR ---
  const insertRear = async () => {
    if (isAnimating) return;
    if (!inputValue.trim()) { setMessage({ text: 'Enter value.', type: 'error' }); return; }

    setIsAnimating(true);
    setStepDescription("Operation: Insert Rear");
    setCodeLines([
      `if (front == 0 && rear == n-1) || (front == rear + 1): Overflow`,
      `if front == -1: front = 0; rear = 0`,
      `else if rear == n - 1: rear = 0`,
      `else: rear = rear + 1`,
      `deque[rear] = item`
    ]);

    setActiveLine(0);
    if ((front === 0 && rear === capacity - 1) || (front === rear + 1)) {
        setMessage({ text: 'Overflow! Deque is full.', type: 'error' });
        await sleep(800); setIsAnimating(false); setActiveLine(-1); return;
    }
    await sleep(600);

    let nextRear;
    if (front === -1) {
        setActiveLine(1);
        setFront(0);
        nextRear = 0;
        setStepDescription("Empty Deque: Init pointers to 0.");
    } else if (rear === capacity - 1) {
        setActiveLine(2);
        nextRear = 0; // Wrap around
        setStepDescription("Rear at end: Wrapping to start (Circular).");
    } else {
        setActiveLine(3);
        nextRear = rear + 1;
        setStepDescription("Incrementing Rear index.");
    }
    setRear(nextRear);
    await sleep(800);

    setActiveLine(4);
    const newDeque = [...deque];
    newDeque[nextRear] = inputValue;
    setDeque(newDeque);

    setInputValue('');
    setMessage({ text: `Inserted "${inputValue}" at Rear (${nextRear})`, type: 'success' });
    logAction(`Insert Rear: ${inputValue}`);
    await sleep(800); setIsAnimating(false); setActiveLine(-1); setStepDescription("Idle");
  };

  // --- 3. DELETE FRONT ---
  const deleteFront = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setStepDescription("Operation: Delete Front");
    setCodeLines([
      `if front == -1: Underflow`,
      `item = deque[front]; deque[front] = null`,
      `if front == rear: front = -1; rear = -1`,
      `else if front == n - 1: front = 0`,
      `else: front = front + 1`
    ]);

    setActiveLine(0);
    if (front === -1) {
        setMessage({ text: 'Underflow! Empty.', type: 'error' });
        await sleep(800); setIsAnimating(false); setActiveLine(-1); return;
    }
    await sleep(600);

    setActiveLine(1);
    const val = deque[front];
    const newDeque = [...deque];
    newDeque[front] = null;
    setDeque(newDeque);
    setStepDescription(`Removed "${val}" from index ${front}.`);
    await sleep(800);

    if (front === rear) {
        setActiveLine(2);
        setFront(-1);
        setRear(-1);
        setStepDescription("Deque now empty. Resetting pointers.");
    } else if (front === capacity - 1) {
        setActiveLine(3);
        setFront(0);
        setStepDescription("Front at end: Wrapping to 0.");
    } else {
        setActiveLine(4);
        setFront(front + 1);
        setStepDescription("Moving Front forward.");
    }

    setMessage({ text: `Deleted "${val}" from Front`, type: 'success' });
    logAction(`Delete Front: ${val}`);
    await sleep(800); setIsAnimating(false); setActiveLine(-1); setStepDescription("Idle");
  };

  // --- 4. DELETE REAR ---
  const deleteRear = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setStepDescription("Operation: Delete Rear");
    setCodeLines([
      `if front == -1: Underflow`,
      `item = deque[rear]; deque[rear] = null`,
      `if front == rear: front = -1; rear = -1`,
      `else if rear == 0: rear = n - 1`,
      `else: rear = rear - 1`
    ]);

    setActiveLine(0);
    if (front === -1) {
        setMessage({ text: 'Underflow! Empty.', type: 'error' });
        await sleep(800); setIsAnimating(false); setActiveLine(-1); return;
    }
    await sleep(600);

    setActiveLine(1);
    const val = deque[rear];
    const newDeque = [...deque];
    newDeque[rear] = null;
    setDeque(newDeque);
    setStepDescription(`Removed "${val}" from index ${rear}.`);
    await sleep(800);

    if (front === rear) {
        setActiveLine(2);
        setFront(-1);
        setRear(-1);
        setStepDescription("Deque now empty. Resetting pointers.");
    } else if (rear === 0) {
        setActiveLine(3);
        setRear(capacity - 1);
        setStepDescription("Rear at 0: Wrapping to end.");
    } else {
        setActiveLine(4);
        setRear(rear - 1);
        setStepDescription("Moving Rear backward.");
    }

    setMessage({ text: `Deleted "${val}" from Rear`, type: 'success' });
    logAction(`Delete Rear: ${val}`);
    await sleep(800); setIsAnimating(false); setActiveLine(-1); setStepDescription("Idle");
  };

  const handleReset = () => {
    setDeque(Array(capacity).fill(null));
    setFront(-1);
    setRear(-1);
    setHistory([]);
    setMessage({ text: 'Reset complete.', type: 'info' });
  };

  // Helper to check if index is active (handling wrap-around)
  const isActive = (i) => {
    if (front === -1) return false;
    if (front <= rear) return i >= front && i <= rear;
    return i >= front || i <= rear;
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9] font-sans p-6 lg:p-12">
      
      {/* 1. HEADER */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <Link 
          to="/queue" 
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e293b] border border-[#334155] hover:border-[#6366f1] transition-all text-sm font-medium text-[#94a3b8] hover:text-white"
        >
          <ArrowLeft size={18} /> Menu
        </Link>
        
        <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500 mb-2">
              Double-Ended Queue
            </h1>
            <p className="text-slate-400 text-sm">Visualizing Insert & Delete at Both Ends</p>
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

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT PANEL (8 Cols): VISUALIZATION & CONTROLS --- */}
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

            {/* MAIN DEQUE REPRESENTATION */}
            <div className="flex items-center gap-4 w-full overflow-x-auto justify-center px-4 py-20 custom-scrollbar">
              {deque.map((val, index) => {
                const isFront = index === front;
                const isRear = index === rear;
                const active = isActive(index);

                return (
                  <div key={index} className="relative flex-shrink-0 flex flex-col items-center group">
                    
                    {/* Front Pointer (Top) - MOVED CLOSER (-top-16) */}
                    {isFront && (
                      <motion.div 
                        layoutId="front-pointer" 
                        className="absolute -top-16 flex flex-col items-center text-emerald-400 z-10"
                      >
                        <div className="text-[10px] font-bold uppercase tracking-widest bg-[#0f172a] px-2 py-0.5 rounded border border-emerald-500/30 mb-0.5">FRONT</div>
                        <ArrowDown size={24} strokeWidth={3} />
                      </motion.div>
                    )}

                    {/* The Node Box */}
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className={`
                        w-16 h-20 rounded-xl flex flex-col items-center justify-center border-2 transition-all duration-300 relative shadow-lg
                        ${active 
                            ? 'bg-[#6366f1] border-[#6366f1] text-white shadow-[#6366f1]/20' 
                            : 'bg-[#0f172a] border-[#334155] text-slate-500 border-dashed opacity-60'
                        }
                      `}
                    >
                      <span className="text-2xl font-bold">{val}</span>
                      <span className="text-[10px] opacity-50 font-mono mt-1">{index}</span>
                    </motion.div>

                    {/* Rear Pointer (Bottom) - MOVED CLOSER (-bottom-16) */}
                    {isRear && (
                      <motion.div 
                        layoutId="rear-pointer" 
                        className="absolute -bottom-16 flex flex-col-reverse items-center text-cyan-400 z-10"
                      >
                         <div className="text-[10px] font-bold uppercase tracking-widest bg-[#0f172a] px-2 py-0.5 rounded border border-cyan-500/30 mt-0.5">REAR</div>
                         <ArrowUp size={24} strokeWidth={3} />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CONTROLS AREA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             
             {/* LEFT ZONE: FRONT OPERATIONS (GREEN THEME) */}
             <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 flex flex-col gap-4 shadow-lg hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center justify-between border-b border-[#334155] pb-3 mb-1">
                    <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Front End</span>
                    <ArrowDown size={16} className="text-emerald-400 opacity-50"/>
                </div>
                
                <div className="flex gap-3">
                    <input 
                      type="text" maxLength={4} value={inputValue} onChange={(e) => setInputValue(e.target.value)} 
                      placeholder="Val" disabled={isAnimating}
                      className="w-20 bg-[#0f172a] border border-[#334155] text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <button onClick={insertFront} disabled={isAnimating} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition-all disabled:opacity-50">
                       <Plus size={16} /> Insert
                    </button>
                </div>
                <button onClick={deleteFront} disabled={isAnimating} className="w-full bg-[#0f172a] border border-[#334155] hover:border-red-500/50 hover:text-red-400 text-slate-300 rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                   <Trash2 size={16} /> Delete Front
                </button>
             </div>

             {/* RIGHT ZONE: REAR OPERATIONS (CYAN THEME) */}
             <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 flex flex-col gap-4 shadow-lg hover:border-cyan-500/30 transition-colors">
                <div className="flex items-center justify-between border-b border-[#334155] pb-3 mb-1">
                    <span className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Rear End</span>
                    <ArrowUp size={16} className="text-cyan-400 opacity-50"/>
                </div>
                
                <div className="flex gap-3">
                    <input 
                      type="text" maxLength={4} value={inputValue} onChange={(e) => setInputValue(e.target.value)} 
                      placeholder="Val" disabled={isAnimating}
                      className="w-20 bg-[#0f172a] border border-[#334155] text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <button onClick={insertRear} disabled={isAnimating} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 transition-all disabled:opacity-50">
                       Insert <Plus size={16} />
                    </button>
                </div>
                <button onClick={deleteRear} disabled={isAnimating} className="w-full bg-[#0f172a] border border-[#334155] hover:border-red-500/50 hover:text-red-400 text-slate-300 rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                   Delete Rear <Trash2 size={16} />
                </button>
             </div>

          </div>
          
          {/* RESET BAR */}
          <button onClick={handleReset} className="w-full py-3 bg-[#1e293b] border border-[#334155] hover:border-yellow-500/50 text-slate-400 hover:text-yellow-400 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all shadow-md">
             <RotateCcw size={16} className="inline mr-2 mb-0.5" /> Reset Deque
          </button>

        </div>

        {/* --- RIGHT PANEL (4 Cols): CODE & LOGS --- */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-[#1e293b] border border-[#334155] rounded-3xl p-6 shadow-lg">
             <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
               <Play size={20} className="text-[#6366f1]" /> Algorithm
             </h3>
             <CodeViewer lines={codeLines} activeLine={activeLine} />
             
             {/* Dynamic Message Box */}
             <AnimatePresence mode="wait">
                <motion.div 
                  key={message.text}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
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
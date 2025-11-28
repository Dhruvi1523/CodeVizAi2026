import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Eye, RotateCcw, Settings, 
  CheckCircle, AlertCircle, Play, Zap, RefreshCw, ArrowDown 
} from 'lucide-react';

// --- Utility: Sleep ---
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Sub-Component: Code Viewer ---
const CodeViewer = ({ lines, activeLine }) => (
  <div className="bg-[#020617] p-4 rounded-xl border border-[#334155] font-mono text-xs md:text-sm overflow-x-auto custom-scrollbar h-48 md:h-auto">
    {lines.map((line, index) => (
      <div 
        key={index}
        className={`px-2 py-1 rounded transition-colors duration-300 whitespace-nowrap ${
          activeLine === index ? 'bg-[#6366f1]/20 border-l-4 border-[#6366f1]' : 'opacity-70 hover:opacity-100'
        }`}
      >
        <span className="text-slate-600 select-none mr-3 w-4 inline-block text-right">{index + 1}</span>
        <span className={activeLine === index ? 'text-white font-bold' : 'text-green-400'}>
          {line}
        </span>
      </div>
    ))}
  </div>
);

export default function CircularQueueVisualizer() {
  // --- STATE ---
  const [capacity, setCapacity] = useState(8); 
  const [inputCapacity, setInputCapacity] = useState(8);
  
  const [queue, setQueue] = useState(Array(8).fill(null));
  const [front, setFront] = useState(-1);
  const [rear, setRear] = useState(-1);
  const [inputValue, setInputValue] = useState('');
  
  // Animation & UI
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState({ text: 'Ready. Start Enqueuing!', type: 'info' });
  const [history, setHistory] = useState([]);
  const [codeLines, setCodeLines] = useState(["# Select an operation"]);
  const [activeLine, setActiveLine] = useState(-1);
  const [stepDescription, setStepDescription] = useState("Idle");

  const logAction = (action) => setHistory((prev) => [action, ...prev].slice(0, 5));

  // --- 1. SET SIZE ---
  const handleSetCapacity = () => {
    let newCap = parseInt(inputCapacity);
    if (isNaN(newCap) || newCap < 3 || newCap > 12) {
      setMessage({ text: 'For circular view, size must be 3-12.', type: 'error' });
      return;
    }
    setCapacity(newCap);
    setQueue(Array(newCap).fill(null));
    setFront(-1);
    setRear(-1);
    setHistory([]);
    setMessage({ text: `Circular Queue resized to ${newCap}.`, type: 'success' });
    setStepDescription("Queue reset.");
  };

  // --- 2. ENQUEUE ---
  const handleEnqueue = async () => {
    if (isAnimating) return;
    if (!inputValue.trim()) {
      setMessage({ text: 'Enter a value.', type: 'error' });
      return;
    }

    setIsAnimating(true);
    setStepDescription("Starting Circular Enqueue...");

    const algoLines = [
      `if (rear + 1) % size == front:`,
      `    return "Overflow"`,
      `else if front == -1: # First element`,
      `    front = 0; rear = 0`,
      `else: rear = (rear + 1) % size`,
      `queue[rear] = item`
    ];
    setCodeLines(algoLines);

    setActiveLine(0);
    setStepDescription(`Checking full condition...`);
    await sleep(800);

    if ((rear + 1) % capacity === front) {
      setActiveLine(1);
      setMessage({ text: 'Overflow! Queue is full.', type: 'error' });
      setStepDescription("Next position equals Front. Queue is Full.");
      await sleep(1000);
      setIsAnimating(false);
      setActiveLine(-1);
      return;
    }

    let nextRear;
    if (front === -1) {
      setActiveLine(2);
      await sleep(600);
      setActiveLine(3);
      setFront(0);
      nextRear = 0;
      setRear(0);
      setStepDescription("Empty Queue: Initializing Front & Rear to 0.");
    } else {
      setActiveLine(4);
      nextRear = (rear + 1) % capacity;
      setRear(nextRear);
      setStepDescription(`Circular Increment: Rear jumps to index ${nextRear}.`);
    }
    await sleep(800);

    setActiveLine(5);
    const newQueue = [...queue];
    newQueue[nextRear] = inputValue;
    setQueue(newQueue);
    
    setInputValue('');
    setMessage({ text: `Enqueued "${inputValue}" at ${nextRear}`, type: 'success' });
    logAction(`Enqueue: ${inputValue}`);
    
    await sleep(800);
    setIsAnimating(false);
    setActiveLine(-1);
    setStepDescription("Idle");
  };

  // --- 3. DEQUEUE ---
  const handleDequeue = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setStepDescription("Starting Circular Dequeue...");

    const algoLines = [
      `if front == -1: return "Underflow"`,
      `item = queue[front]`,
      `if front == rear: # Last item?`,
      `    front = -1; rear = -1`,
      `else: front = (front + 1) % size`
    ];
    setCodeLines(algoLines);

    setActiveLine(0);
    await sleep(600);

    if (front === -1) {
      setMessage({ text: 'Underflow! Queue is empty.', type: 'error' });
      setStepDescription("Front is -1. Nothing to dequeue.");
      await sleep(800);
      setIsAnimating(false);
      setActiveLine(-1);
      return;
    }

    setActiveLine(1);
    const item = queue[front];
    const newQueue = [...queue];
    newQueue[front] = null;
    setQueue(newQueue);
    setStepDescription(`Removing "${item}" from index ${front}...`);
    await sleep(800);

    if (front === rear) {
      setActiveLine(2);
      await sleep(600);
      setActiveLine(3);
      setFront(-1);
      setRear(-1);
      setStepDescription("Last element removed. Resetting pointers to -1.");
    } else {
      setActiveLine(4);
      const nextFront = (front + 1) % capacity;
      setFront(nextFront);
      setStepDescription(`Circular Increment: Front moves to index ${nextFront}.`);
    }
    
    setMessage({ text: `Dequeued "${item}".`, type: 'success' });
    logAction(`Dequeue: ${item}`);

    await sleep(800);
    setIsAnimating(false);
    setActiveLine(-1);
    setStepDescription("Idle");
  };

  // --- 4. AUTO FILL ---
  const handleAutoFill = () => {
    if (isAnimating) return;
    if ((rear + 1) % capacity === front) {
      setMessage({ text: 'Queue is already full!', type: 'error' });
      return;
    }

    const newQueue = [...queue];
    let tempRear = rear;
    let tempFront = front;
    
    if (tempFront === -1) { tempFront = 0; tempRear = -1; }

    let count = 0;
    for(let i=0; i<capacity; i++) {
        const next = (tempRear + 1) % capacity;
        if(next === tempFront && count > 0) break; 
        
        newQueue[next] = Math.floor(Math.random() * 99) + 1;
        tempRear = next;
        count++;
    }

    setFront(tempFront);
    setRear(tempRear);
    setQueue(newQueue);
    setMessage({ text: `Auto-filled ${count} items.`, type: 'success' });
    logAction('Auto-Fill Random');
  };

  const handleReset = () => {
    if(isAnimating) return;
    setQueue(Array(capacity).fill(null));
    setFront(-1);
    setRear(-1);
    setHistory([]);
    setCodeLines(["# Queue Reset"]);
    setActiveLine(-1);
    setMessage({ text: 'Reset complete.', type: 'info' });
  };

  const handlePeek = () => {
    if (front === -1) {
        setMessage({ text: 'Queue is empty.', type: 'error' });
        return;
    }
    setMessage({ text: `Front value: ${queue[front]}`, type: 'info' });
  };

  // --- LAYOUT MATH ---
  // UPDATED: Center X/Y is now 225 to fit the larger box
  const getCoordinates = (index, total) => {
    const radius = 130; 
    const centerX = 225; // Updated center
    const centerY = 225; // Updated center
    const angle = (index * (360 / total) - 90) * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  // UPDATED: Pointer Position logic
  const getPointerPosition = (index, total) => {
    const radius = 215; 
    const centerX = 225; // Updated center
    const centerY = 225; // Updated center
    const angleDeg = index * (360 / total) - 90;
    const angleRad = angleDeg * (Math.PI / 180);
    
    return {
      x: centerX + radius * Math.cos(angleRad),
      y: centerY + radius * Math.sin(angleRad),
      rotation: angleDeg + 90 
    };
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9] font-sans p-4 md:p-8">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link 
          to="/queue" 
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1e293b] border border-[#334155] hover:border-[#6366f1] transition-colors text-sm font-medium text-[#94a3b8] hover:text-white"
        >
          <ArrowLeft size={16} /> Menu
        </Link>
        
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
              Circular Queue
            </h1>
            <p className="text-xs text-slate-400 mt-1">Ring Buffer Visualization</p>
        </div>

        <div className="flex items-center gap-2 bg-[#1e293b] p-2 rounded-lg border border-[#334155]">
           <Settings size={16} className="text-slate-400 ml-2" />
           <input 
             type="number" 
             min="3" max="12"
             value={inputCapacity}
             onChange={(e) => setInputCapacity(e.target.value)}
             className="w-12 bg-[#0f172a] text-white border border-[#334155] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#6366f1]"
           />
           <button 
             onClick={handleSetCapacity}
             className="text-xs bg-[#6366f1] hover:bg-[#5457e5] px-3 py-1.5 rounded text-white font-medium transition-colors"
           >
             Set Size
           </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- LEFT PANEL: CIRCLE VISUALIZER --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* INCREASED HEIGHT TO 500PX to accommodate the pointers at the top */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-4 shadow-xl min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
            
            {/* Live Toast - Moved to Bottom Right to avoid overlap */}
            <motion.div 
              key={stepDescription}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 right-4 z-20 bg-[#0f172a]/90 backdrop-blur-sm border border-[#6366f1]/30 px-4 py-1.5 rounded-full text-xs font-medium text-[#a5a6f6] shadow-lg"
            >
              {stepDescription}
            </motion.div>

            {/* CIRCLE STAGE: INCREASED TO 450x450 */}
            <div className="relative w-[450px] h-[450px] flex items-center justify-center">
                
                {/* SVG Ring Background - Centered at 225,225 */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <circle cx="225" cy="225" r="130" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="8 8" />
                </svg>

                {/* Nodes */}
                {queue.map((val, index) => {
                    const { x, y } = getCoordinates(index, capacity);
                    
                    // Active Logic
                    let isActive = false;
                    if (front !== -1) {
                        if (front <= rear) isActive = index >= front && index <= rear;
                        else isActive = index >= front || index <= rear;
                    }

                    return (
                        <motion.div
                            key={index}
                            className={`absolute w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold border-2 shadow-lg transition-all duration-300 z-10
                                ${isActive 
                                    ? 'bg-[#6366f1] border-[#6366f1] text-white z-20 shadow-[#6366f1]/40' 
                                    : 'bg-[#0f172a] border-[#334155] text-slate-600'
                                }`}
                            style={{ 
                                left: x - 24, // Center div
                                top: y - 24 
                            }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                        >
                            {val}
                            {/* Index Label */}
                             <div 
                                className="absolute text-[10px] text-slate-500 font-mono"
                                style={{
                                    transform: `translate(${Math.cos((index * 360/capacity - 90)*Math.PI/180) * 35}px, ${Math.sin((index * 360/capacity - 90)*Math.PI/180) * 35}px)`
                                }}
                            >
                                {index}
                            </div>
                        </motion.div>
                    );
                })}

                {/* FRONT POINTER */}
                {front !== -1 && (() => {
                    const { x, y, rotation } = getPointerPosition(front, capacity);
                    return (
                        <motion.div 
                            className="absolute flex flex-col items-center justify-center text-emerald-400 z-30"
                            style={{ left: x - 20, top: y - 20, width: 40, height: 40 }} 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, x: 0, y: 0 }} 
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                            <div style={{ transform: `rotate(${rotation}deg)` }} className="flex flex-col items-center">
                                <div className="text-[10px] font-bold uppercase tracking-wider bg-[#0f172a] px-1 rounded shadow-sm border border-emerald-500/30 mb-1">
                                    Front
                                </div>
                                <ArrowDown size={20} className="text-emerald-400" />
                            </div>
                        </motion.div>
                    );
                })()}

                 {/* REAR POINTER */}
                 {rear !== -1 && (() => {
                    const { x, y, rotation } = getPointerPosition(rear, capacity);
                    return (
                        <motion.div 
                            className="absolute flex flex-col items-center justify-center text-cyan-400 z-30"
                            style={{ left: x - 20, top: y - 20, width: 40, height: 40 }} 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }} 
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                            <div style={{ transform: `rotate(${rotation}deg)` }} className="flex flex-col items-center">
                                <div className="text-[10px] font-bold uppercase tracking-wider bg-[#0f172a] px-1 rounded shadow-sm border border-cyan-500/30 mb-1">
                                    Rear
                                </div>
                                <ArrowDown size={20} className="text-cyan-400" />
                            </div>
                        </motion.div>
                    );
                })()}

                {/* Center Info */}
                <div className="absolute flex flex-col items-center justify-center text-slate-500 text-xs">
                    <RefreshCw size={24} className="opacity-20 mb-1" />
                    <span>Capacity: {capacity}</span>
                </div>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6">
             <div className="flex flex-col md:flex-row gap-3 mb-4">
                <input 
                  type="text" 
                  maxLength={5}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEnqueue()}
                  placeholder="Enter value"
                  disabled={isAnimating}
                  className="flex-1 bg-[#0f172a] border border-[#334155] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#6366f1] disabled:opacity-50"
                />
                <button 
                  onClick={handleEnqueue}
                  disabled={isAnimating}
                  className="bg-[#6366f1] hover:bg-[#5457e5] disabled:bg-[#334155] disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#6366f1]/20 transition-all"
                >
                  <Plus size={18} /> Enqueue
                </button>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               <button onClick={handleDequeue} disabled={isAnimating} className="px-4 py-3 bg-[#0f172a] border border-[#334155] hover:border-red-500/50 hover:text-red-400 text-slate-300 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-sm">
                  <Trash2 size={16} /> Dequeue
               </button>
               <button onClick={handlePeek} disabled={isAnimating} className="px-4 py-3 bg-[#0f172a] border border-[#334155] hover:border-blue-400/50 hover:text-blue-400 text-slate-300 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-sm">
                  <Eye size={16} /> Peek
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
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6">
             <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
               <Play size={16} className="text-[#6366f1]" /> 
               Logic Execution
             </h3>
             <CodeViewer lines={codeLines} activeLine={activeLine} />
             <AnimatePresence mode="wait">
                <motion.div 
                  key={message.text}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`mt-4 p-3 rounded-lg border text-xs md:text-sm font-medium flex gap-2 items-start
                    ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' : 
                      message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-200' : 
                      'bg-blue-500/10 border-blue-500/20 text-blue-200'}`}
                >
                  {message.type === 'error' ? <AlertCircle size={16} className="mt-0.5 shrink-0" /> : <CheckCircle size={16} className="mt-0.5 shrink-0" />}
                  {message.text}
                </motion.div>
             </AnimatePresence>
          </div>

          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 flex-grow min-h-[200px]">
            <h3 className="text-[#94a3b8] font-bold text-xs uppercase tracking-wider mb-4">History</h3>
            <ul className="space-y-3">
              <AnimatePresence>
                {history.length === 0 && <li className="text-slate-600 italic text-sm">No operations yet.</li>}
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
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Eye, RotateCcw, Settings, 
  CheckCircle, AlertCircle, Ban, Play, Zap 
} from 'lucide-react';

// --- Utility: Sleep function for animations ---
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Sub-Component: Code Viewer ---
const CodeViewer = ({ lines, activeLine }) => {
  return (
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
};

export default function SimpleQueueVisualizer() {
  // --- STATE ---
  const [capacity, setCapacity] = useState(7);
  const [inputCapacity, setInputCapacity] = useState(7);
  const [queue, setQueue] = useState(Array(7).fill(null));
  const [front, setFront] = useState(0);
  const [rear, setRear] = useState(-1);
  const [inputValue, setInputValue] = useState('');
  
  // Animation State
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState({ text: 'Ready to start.', type: 'info' });
  const [history, setHistory] = useState([]);
  const [codeLines, setCodeLines] = useState(["# Select an operation to see code"]);
  const [activeLine, setActiveLine] = useState(-1);
  const [stepDescription, setStepDescription] = useState("Idle");

  // Helper: Scroll to rear on update
  const scrollRef = useRef(null);

  const logAction = (action) => setHistory((prev) => [action, ...prev].slice(0, 5));

  // --- 1. SETTINGS HANDLER ---
  const handleSetCapacity = () => {
    let newCap = parseInt(inputCapacity);
    if (isNaN(newCap) || newCap < 3 || newCap > 20) {
      setMessage({ text: 'Size must be between 3 and 20.', type: 'error' });
      return;
    }
    setCapacity(newCap);
    setQueue(Array(newCap).fill(null));
    setFront(0);
    setRear(-1);
    setHistory([]);
    setMessage({ text: `Capacity set to ${newCap}.`, type: 'success' });
    setStepDescription("Queue resized and reset.");
  };

  // --- 2. ENQUEUE ANIMATION ---
  const handleEnqueue = async () => {
    if (isAnimating) return;
    if (!inputValue.trim()) {
      setMessage({ text: 'Please enter a value.', type: 'error' });
      return;
    }

    setIsAnimating(true);
    setStepDescription("Starting Enqueue...");

    const algoLines = [
      `if rear == capacity - 1: # (${rear} == ${capacity - 1})?`,
      `    return "Overflow"`,
      `rear = rear + 1          # New Rear: ${rear + 1}`,
      `queue[rear] = "${inputValue}"`
    ];
    setCodeLines(algoLines);

    setActiveLine(0); // Check Overflow
    await sleep(600);

    if (rear === capacity - 1) {
      setActiveLine(1);
      setMessage({ text: 'Overflow! Queue is full.', type: 'error' });
      setStepDescription("Queue Limit Reached.");
      await sleep(800);
      setIsAnimating(false);
      setActiveLine(-1);
      return;
    }

    setActiveLine(2); // Increment Rear
    const newRear = rear + 1;
    setRear(newRear);
    setStepDescription(`Moving Rear to index ${newRear}.`);
    // Auto scroll if needed
    if(scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    await sleep(600);

    setActiveLine(3); // Insert
    const newQueue = [...queue];
    newQueue[newRear] = inputValue;
    setQueue(newQueue);
    
    setInputValue('');
    setMessage({ text: `Enqueued "${inputValue}" at ${newRear}`, type: 'success' });
    setStepDescription("Inserted Successfully.");
    logAction(`Enqueue: ${inputValue}`);
    
    await sleep(800);
    setIsAnimating(false);
    setActiveLine(-1);
    setStepDescription("Idle");
  };

  // --- 3. DEQUEUE ANIMATION ---
  const handleDequeue = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setStepDescription("Starting Dequeue...");

    const algoLines = [
      `if front > rear:     # (${front} > ${rear})?`,
      `    return "Underflow"`,
      `item = queue[front]  # Grabbing "${queue[front] || 'null'}"`,
      `front = front + 1    # New Front: ${front + 1}`
    ];
    setCodeLines(algoLines);

    setActiveLine(0); // Check Underflow
    await sleep(600);

    if (front > rear) {
      setActiveLine(1);
      setMessage({ text: 'Underflow! Queue is empty.', type: 'error' });
      setStepDescription("Queue is already empty.");
      await sleep(800);
      setIsAnimating(false);
      setActiveLine(-1);
      return;
    }

    setActiveLine(2); // Read Item
    const item = queue[front];
    const newQueue = [...queue];
    newQueue[front] = null; // Visually clear
    setQueue(newQueue);
    setStepDescription(`Reading "${item}"...`);
    await sleep(600);

    setActiveLine(3); // Move Front
    setFront(front + 1);
    setMessage({ text: `Dequeued "${item}".`, type: 'success' });
    setStepDescription(`Index ${front} is now Wasted Space.`);
    logAction(`Dequeue: ${item}`);

    await sleep(800);
    setIsAnimating(false);
    setActiveLine(-1);
    setStepDescription("Idle");
  };

  // --- 4. PEEK ANIMATION (NEW) ---
  const handlePeek = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setStepDescription("Peeking at Front...");

    const algoLines = [
      `if front > rear:    # (${front} > ${rear})?`,
      `    return "Empty"`,
      `return queue[front] # Index ${front}`
    ];
    setCodeLines(algoLines);

    setActiveLine(0);
    await sleep(600);

    if (front > rear) {
      setActiveLine(1);
      setMessage({ text: 'Queue is empty.', type: 'error' });
      await sleep(800);
      setIsAnimating(false);
      setActiveLine(-1);
      return;
    }

    setActiveLine(2);
    const item = queue[front];
    setMessage({ text: `Peek: Front is "${item}"`, type: 'info' });
    setStepDescription(`Found "${item}" at Front.`);
    logAction(`Peek: ${item}`);

    await sleep(800);
    setIsAnimating(false);
    setActiveLine(-1);
    setStepDescription("Idle");
  };

  // --- 5. AUTO FILL (NEW) ---
  const handleAutoFill = () => {
    if (isAnimating) return;
    if (rear === capacity - 1) {
      setMessage({ text: 'Queue is already full!', type: 'error' });
      return;
    }

    const newQueue = [...queue];
    let currentRear = rear;
    const addedItems = [];

    for(let i = rear + 1; i < capacity; i++) {
        const randomVal = Math.floor(Math.random() * 99) + 1;
        newQueue[i] = randomVal;
        currentRear = i;
        addedItems.push(randomVal);
    }

    setQueue(newQueue);
    setRear(currentRear);
    setMessage({ text: `Auto-filled ${addedItems.length} items.`, type: 'success' });
    logAction(`Auto-Fill: ${addedItems.length} items`);
    setCodeLines(["# Auto-Fill Operation", "for i in range(rear+1, capacity):", "  queue[i] = random()"]);
  };

  // --- 6. RESET ---
  const handleReset = () => {
    if(isAnimating) return;
    setQueue(Array(capacity).fill(null));
    setFront(0);
    setRear(-1);
    setHistory([]);
    setCodeLines(["# Queue Reset"]);
    setActiveLine(-1);
    setMessage({ text: 'Queue reset.', type: 'info' });
    setStepDescription("Everything cleared.");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9] font-sans p-4 md:p-8">
      
      {/* HEADER & SETTINGS */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link 
          to="/queue" 
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1e293b] border border-[#334155] hover:border-[#6366f1] transition-colors text-sm font-medium text-[#94a3b8] hover:text-white"
        >
          <ArrowLeft size={16} /> 
        </Link>
        
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-[#a855f7]">
              Simple Queue
            </h1>
            <p className="text-xs text-slate-400 mt-1">Step-by-Step Visualization</p>
        </div>

        <div className="flex items-center gap-2 bg-[#1e293b] p-2 rounded-lg border border-[#334155]">
           <Settings size={16} className="text-slate-400 ml-2" />
           <input 
             type="number" 
             min="3" max="20"
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
        
        {/* --- LEFT PANEL (Visualizer) --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* VISUALIZATION STAGE */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-4 md:p-8 shadow-xl min-h-[360px] flex flex-col items-center justify-center relative overflow-hidden">
            
            {/* Live Status Toast */}
            <motion.div 
              key={stepDescription}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-0 right-0 mx-auto w-fit bg-[#0f172a]/90 backdrop-blur-sm border border-[#6366f1]/30 px-4 py-1.5 rounded-full text-xs font-medium text-[#a5a6f6] shadow-lg z-20"
            >
              {stepDescription}
            </motion.div>

            {/* QUEUE CONTAINER (Fixed "Hide" Issue) 
                Changed justify-center to justify-start on small screens or large content 
                Added px-8 to ensure padding on edges so first box isn't hidden 
            */}
            <div 
              ref={scrollRef}
              className="flex items-end gap-3 w-full overflow-x-auto pt-20 pb-16 px-8 custom-scrollbar"
              style={{ justifyContent: queue.length > 8 ? 'flex-start' : 'center' }}
            >
              {queue.map((val, index) => {
                const isFront = index === front;
                const isRear = index === rear;
                const isWasted = index < front;

                return (
                  <div key={index} className="relative flex-shrink-0 flex flex-col items-center group">
                    
                    {/* Front Pointer */}
                    {isFront && front <= rear + 1 && (
                      <motion.div layoutId="front-pointer" className="absolute -top-10 flex flex-col items-center text-green-400 z-10">
                        <span className="text-[10px] font-bold uppercase tracking-wider mb-1">Front</span>
                        <div className="w-0.5 h-4 bg-green-400"></div>
                      </motion.div>
                    )}

                    {/* Box */}
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className={`
                        w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center text-lg font-bold border-2 transition-all duration-300 relative
                        ${isWasted 
                            ? 'bg-[#0f172a] border-dashed border-red-500/20 text-slate-700 opacity-60' 
                            : val !== null 
                                ? 'bg-[#6366f1] border-[#6366f1] text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                                : 'bg-[#0f172a] border-[#334155] text-slate-600'
                        }
                      `}
                    >
                      {isWasted && <Ban size={24} className="absolute text-red-500/20" />}
                      {val}
                    </motion.div>

                    {/* Index */}
                    <span className={`mt-2 text-[10px] font-mono ${isWasted ? 'text-red-900' : 'text-slate-500'}`}>
                        {index}
                    </span>

                    {/* Rear Pointer */}
                    {isRear && (
                      <motion.div layoutId="rear-pointer" className="absolute -bottom-10 flex flex-col-reverse items-center text-[#a855f7] z-10">
                         <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Rear</span>
                         <div className="w-0.5 h-4 bg-[#a855f7]"></div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="absolute bottom-3 left-4 flex gap-4 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
               <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-[#6366f1]"></div> Data</div>
               <div className="flex items-center gap-1"><div className="w-3 h-3 rounded border border-dashed border-red-500/40"></div> Wasted</div>
            </div>
          </div>

          {/* CONTROLS (Updated with all buttons) */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6">
             {/* Row 1: Input & Enqueue */}
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
                  disabled={isAnimating || rear === capacity - 1}
                  className="bg-[#6366f1] hover:bg-[#5457e5] disabled:bg-[#334155] disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#6366f1]/20 transition-all"
                >
                  <Plus size={18} /> Enqueue
                </button>
             </div>
             
             {/* Row 2: Operations Grid */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               <button 
                  onClick={handleDequeue}
                  disabled={isAnimating}
                  className="px-4 py-3 bg-[#0f172a] border border-[#334155] hover:border-red-500/50 hover:text-red-400 text-slate-300 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-sm"
                >
                  <Trash2 size={16} /> Dequeue
               </button>
               
               <button 
                  onClick={handlePeek}
                  disabled={isAnimating}
                  className="px-4 py-3 bg-[#0f172a] border border-[#334155] hover:border-blue-400/50 hover:text-blue-400 text-slate-300 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-sm"
                >
                  <Eye size={16} /> Peek
               </button>

               <button 
                  onClick={handleAutoFill}
                  disabled={isAnimating || rear === capacity - 1}
                  className="px-4 py-3 bg-[#0f172a] border border-[#334155] hover:border-[#a855f7]/50 hover:text-[#a855f7] text-slate-300 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-sm"
                >
                  <Zap size={16} /> Auto Fill
               </button>

               <button 
                  onClick={handleReset}
                  disabled={isAnimating}
                  className="px-4 py-3 bg-[#0f172a] border border-[#334155] hover:border-yellow-500/50 hover:text-yellow-400 text-slate-300 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-sm"
                >
                  <RotateCcw size={16} /> Reset
               </button>
             </div>
          </div>
        </div>

        {/* --- RIGHT PANEL (Code & Log) --- */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* CODE PANEL */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6">
             <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
               <Play size={16} className="text-[#6366f1]" /> 
               Logic Execution
             </h3>
             <CodeViewer lines={codeLines} activeLine={activeLine} />

             {/* Status Alert */}
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

          {/* HISTORY PANEL */}
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
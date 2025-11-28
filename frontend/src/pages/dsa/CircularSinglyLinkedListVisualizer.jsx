import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, RotateCcw, Play, 
  Search, Zap, ArrowRight, CornerDownLeft
} from 'lucide-react';

// --- CONFIG ---
const ANIMATION_SPEED = 800; 
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- GEOMETRY MATH ---
const RADIUS = 140;
const CENTER_X = 250;
const CENTER_Y = 200;

// Calculates X/Y coordinates for a node based on its index and total nodes
const getCoordinates = (index, total) => {
  if (total === 0) return { x: CENTER_X, y: CENTER_Y };
  // Start from -90deg (Top)
  const angle = (index / total) * 2 * Math.PI - (Math.PI / 2);
  return {
    x: CENTER_X + RADIUS * Math.cos(angle),
    y: CENTER_Y + RADIUS * Math.sin(angle)
  };
};

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

export default function CircularLinkedListVisualizer() {
  // --- STATE ---
  const [list, setList] = useState([]);
  const [inputValue, setInputValue] = useState('');
  
  // Animation State
  // pointers: { current: index, found: index, delete: index, new: index }
  const [pointers, setPointers] = useState({ current: -1, found: -1, delete: -1, new: -1 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState('List is empty.');
  const [codeLines, setCodeLines] = useState(["// Circular Singly Linked List"]);
  const [activeLine, setActiveLine] = useState(-1);

  // --- OPERATIONS ---

  const handleAutoFill = () => {
    if (isAnimating) return;
    const sampleData = [10, 20, 30, 40, 50];
    const newNodes = sampleData.map((val, i) => ({ id: Date.now() + i, val }));
    setList(newNodes);
    setMessage("Auto-filled circular list.");
  };

  const insertHead = async () => {
    if (isAnimating || !inputValue) { setMessage("Enter value."); return; }
    setIsAnimating(true);
    
    setCodeLines([
      `newNode = new Node(${inputValue})`, 
      `if head == null: newNode.next = newNode; head = newNode`, 
      `else: tail = head; while(tail.next != head) tail = tail.next`,
      `tail.next = newNode; newNode.next = head; head = newNode`
    ]);

    setActiveLine(0); await sleep(ANIMATION_SPEED);

    if (list.length === 0) {
        setActiveLine(1);
        const newNode = { id: Date.now(), val: inputValue };
        setList([newNode]);
        setMessage("List initialized (Head points to self).");
        setInputValue('');
        await sleep(ANIMATION_SPEED);
    } else {
        // Find Tail Visual
        setMessage("Traversing to Tail to update loop...");
        setActiveLine(2);
        for(let i=0; i<list.length; i++) {
            setPointers({ current: i });
            await sleep(300);
        }
        
        setActiveLine(3);
        const newNode = { id: Date.now(), val: inputValue };
        setList([newNode, ...list]);
        setMessage("Inserted at Head. Tail connection updated.");
        setInputValue('');
    }
    
    setPointers({ current: -1 });
    await sleep(ANIMATION_SPEED);
    setIsAnimating(false); setActiveLine(-1);
  };

  const insertTail = async () => {
    if (isAnimating || !inputValue) { setMessage("Enter value."); return; }
    setIsAnimating(true);
    
    setCodeLines([
      `newNode = new Node(${inputValue})`, 
      `if head == null: head = newNode; newNode.next = head`, 
      `curr = head; while(curr.next != head) curr = curr.next`,
      `curr.next = newNode; newNode.next = head`
    ]);

    setActiveLine(0); await sleep(ANIMATION_SPEED);

    if (list.length === 0) {
        setActiveLine(1);
        setList([{ id: Date.now(), val: inputValue }]);
        setMessage("List was empty. Inserted at Head.");
        setInputValue('');
        await sleep(ANIMATION_SPEED);
    } else {
        setActiveLine(2);
        setMessage("Traversing to find Tail...");
        for(let i=0; i<list.length; i++) {
            setPointers({ current: i });
            await sleep(300);
        }

        setActiveLine(3);
        const newNode = { id: Date.now(), val: inputValue };
        setList([...list, newNode]);
        setMessage("Inserted at Tail. Cycle maintained.");
        setInputValue('');
    }

    setPointers({ current: -1 });
    await sleep(ANIMATION_SPEED);
    setIsAnimating(false); setActiveLine(-1);
  };

  const deleteHead = async () => {
    if (isAnimating || list.length === 0) return;
    setIsAnimating(true);
    setCodeLines([
      `if head.next == head: head = null`, 
      `else: tail = head; while(tail.next != head) tail = tail.next`,
      `head = head.next`,
      `tail.next = head; free(oldHead)`
    ]);

    setActiveLine(0); await sleep(ANIMATION_SPEED);

    if (list.length === 1) {
        setList([]);
        setMessage("List is now empty.");
    } else {
        setActiveLine(1);
        setMessage("Finding Tail to update next pointer...");
        for(let i=0; i<list.length; i++) {
            setPointers({ current: i });
            await sleep(300);
        }

        setActiveLine(2);
        setPointers({ delete: 0 }); // Mark head for deletion
        setMessage("Removing Head...");
        await sleep(ANIMATION_SPEED);

        setActiveLine(3);
        setList(list.slice(1));
        setMessage("Head removed. Tail points to new Head.");
    }

    setPointers({ current: -1, delete: -1 });
    await sleep(ANIMATION_SPEED);
    setIsAnimating(false); setActiveLine(-1);
  };

  const deleteTail = async () => {
    if (isAnimating || list.length === 0) return;
    setIsAnimating(true);
    setCodeLines([
      `curr = head; while(curr.next.next != head) curr = curr.next`, 
      `curr.next = head`,
      `free(tail)`
    ]);

    if (list.length === 1) {
        setList([]);
        setIsAnimating(false);
        return;
    }

    setActiveLine(0);
    setMessage("Traversing to second-to-last node...");
    for(let i=0; i < list.length - 1; i++) {
        setPointers({ current: i });
        await sleep(400);
    }

    setActiveLine(1);
    setMessage("Updating connection to skip Tail...");
    await sleep(ANIMATION_SPEED);

    setActiveLine(2);
    setPointers({ current: list.length - 2, delete: list.length - 1 });
    await sleep(ANIMATION_SPEED);

    setList(list.slice(0, -1));
    setMessage("Tail removed. Cycle maintained.");

    setPointers({ current: -1, delete: -1 });
    await sleep(ANIMATION_SPEED);
    setIsAnimating(false); setActiveLine(-1);
  };

  const handleReset = () => {
    setList([]);
    setMessage("List cleared.");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9] font-sans p-4 md:p-8">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link to="/linkedlist" className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] border border-[#334155] rounded-xl hover:border-[#6366f1] transition text-sm text-slate-400 hover:text-white">
          <ArrowLeft size={16} /> 
        </Link>
        <div className="text-center">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Circular Singly Linked List
            </h1>
            <p className="text-xs text-slate-500 mt-1">Nodes connected in a ring (Tail → Head)</p>
        </div>
        <div className="w-24"></div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- LEFT: VISUALIZER (8 Cols) --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STAGE */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 min-h-[450px] flex flex-col relative overflow-hidden shadow-2xl">
            
            {/* Live Message */}
            <div className="absolute top-4 left-0 right-0 mx-auto w-fit z-20">
               <motion.span 
                 key={message}
                 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                 className="bg-[#0f172a]/90 px-4 py-1.5 rounded-full border border-[#6366f1]/30 text-xs font-mono text-[#a5a6f6]"
               >
                 {message}
               </motion.span>
            </div>

            {/* --- VISUALIZATION AREA --- */}
            <div className="flex-1 relative flex items-center justify-center">
                
                {/* 1. RENDER ARROWS (SVG Layer) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
                        </marker>
                    </defs>
                    {list.map((_, i) => {
                        const start = getCoordinates(i, list.length);
                        const endIdx = (i + 1) % list.length; // Wrap around to 0
                        const end = getCoordinates(endIdx, list.length);
                        
                        // If only 1 node, draw a self-loop
                        if (list.length === 1) {
                            return (
                                <path 
                                    key={i} 
                                    d={`M ${start.x} ${start.y - 20} C ${start.x + 50} ${start.y - 80}, ${start.x - 50} ${start.y - 80}, ${start.x} ${start.y - 25}`}
                                    stroke="#475569" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"
                                />
                            );
                        }

                        return (
                            <line 
                                key={i}
                                x1={start.x} y1={start.y}
                                x2={end.x} y2={end.y}
                                stroke="#475569" strokeWidth="2"
                                markerEnd="url(#arrowhead)"
                            />
                        );
                    })}
                </svg>

                {/* 2. RENDER NODES */}
                <AnimatePresence>
                    {list.length === 0 && <div className="text-slate-600 font-mono text-sm">List is Empty</div>}
                    {list.map((node, i) => {
                        const coords = getCoordinates(i, list.length);
                        
                        // Highlight Logic
                        let borderColor = 'border-[#334155]';
                        let bgColor = 'bg-[#1e293b]';
                        let shadow = '';

                        if (pointers.current === i) {
                            borderColor = 'border-yellow-400';
                            bgColor = 'bg-yellow-400/20';
                            shadow = 'shadow-[0_0_15px_rgba(250,204,21,0.4)]';
                        } else if (pointers.delete === i) {
                            borderColor = 'border-red-500';
                            bgColor = 'bg-red-500/20';
                        } else if (i === 0) {
                            // Head styling
                            borderColor = 'border-emerald-500';
                        }

                        return (
                            <motion.div
                                key={node.id}
                                layout
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ 
                                    scale: 1, opacity: 1,
                                    x: coords.x - CENTER_X, // Center relative to stage center
                                    y: coords.y - CENTER_Y 
                                }}
                                exit={{ scale: 0, opacity: 0 }}
                                className={`absolute w-12 h-12 rounded-full flex items-center justify-center border-2 text-white font-bold text-sm shadow-lg z-10 ${borderColor} ${bgColor} ${shadow}`}
                                style={{
                                    // Use translate to position from center (250, 200)
                                    top: CENTER_Y - 24, 
                                    left: CENTER_X - 24
                                }}
                            >
                                {node.val}
                                
                                {/* Head Label */}
                                {i === 0 && (
                                    <div className="absolute -top-6 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Head</div>
                                )}
                                {/* Index */}
                                <div className="absolute -bottom-5 text-[8px] text-slate-500 font-mono">#{i}</div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

            </div>
          </div>

          {/* CONTROLS */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6">
            <div className="flex gap-3 mb-6">
              <input 
                value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                placeholder="Value" disabled={isAnimating}
                className="flex-1 bg-[#0f172a] border border-[#334155] text-white px-4 py-2.5 rounded-xl text-sm focus:border-purple-500 outline-none transition-colors"
              />
              <button onClick={handleAutoFill} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-purple-600/20 text-purple-400 border border-purple-600/50 hover:bg-purple-600/30 px-6 py-2.5 rounded-xl text-xs font-bold transition-all">
                <Zap size={14} /> Auto Fill
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button onClick={insertHead} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-emerald-600/20 text-emerald-400 border border-emerald-600/50 hover:bg-emerald-600/30 py-2.5 rounded-xl text-xs font-bold transition-all">
                <Plus size={14} /> Insert Head
              </button>
              <button onClick={insertTail} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-emerald-600/20 text-emerald-400 border border-emerald-600/50 hover:bg-emerald-600/30 py-2.5 rounded-xl text-xs font-bold transition-all">
                <CornerDownLeft size={14} /> Insert Tail
              </button>
              <button onClick={deleteHead} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-red-600/10 text-red-400 border border-red-600/30 hover:bg-red-600/20 py-2.5 rounded-xl text-xs font-bold transition-all">
                <Trash2 size={14} /> Delete Head
              </button>
              <button onClick={deleteTail} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-red-600/10 text-red-400 border border-red-600/30 hover:bg-red-600/20 py-2.5 rounded-xl text-xs font-bold transition-all">
                <Trash2 size={14} /> Delete Tail
              </button>
              
              <button onClick={handleReset} disabled={isAnimating} className="col-span-2 md:col-span-4 flex items-center justify-center gap-2 bg-slate-700/30 text-slate-400 border border-slate-600/50 hover:bg-slate-700/50 py-2.5 rounded-xl text-xs font-bold transition-all mt-2">
                <RotateCcw size={14} /> Clear List
              </button>
            </div>
          </div>
        </div>

        {/* --- RIGHT: CODE (4 Cols) --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 h-full shadow-lg">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-white font-bold flex items-center gap-2 text-sm"><Play size={16} className="text-purple-400"/> Logic Trace</h3>
               <span className="text-[10px] bg-[#0f172a] px-2 py-1 rounded text-slate-500">Mode: Circular</span>
            </div>
            
            <CodeViewer lines={codeLines} activeLine={activeLine} />
            
            <div className="mt-6 p-4 bg-[#0f172a] rounded-xl border border-[#334155]">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3 border-b border-[#334155] pb-2">Properties</h4>
              <ul className="text-[10px] text-purple-400 space-y-2 font-mono">
                  <li className="flex items-start gap-2"><span className="text-slate-600">•</span> Tail.next points to Head</li>
                  <li className="flex items-start gap-2"><span className="text-slate-600">•</span> No NULL termination</li>
                  <li className="flex items-start gap-2"><span className="text-slate-600">•</span> Infinite traversal possible</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, RotateCcw, Play, 
  Zap, ArrowRight, CornerDownLeft, ArrowDown, ArrowUp
} from 'lucide-react';

// --- CONFIG ---
const ANIMATION_SPEED = 1000; // Slower for clarity
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- GEOMETRY MATH ---
const RADIUS = 130; 
const CENTER_X = 250;
const CENTER_Y = 250; // Increased vertical center for better spacing

// Get Node Position
const getCoordinates = (index, total) => {
  if (total === 0) return { x: CENTER_X, y: CENTER_Y };
  const angle = (index / total) * 2 * Math.PI - (Math.PI / 2); // Start -90deg (Top)
  return {
    x: CENTER_X + RADIUS * Math.cos(angle),
    y: CENTER_Y + RADIUS * Math.sin(angle),
    angle: angle
  };
};

// Get External Pointer Position (For Head/Tail labels)
const getLabelCoordinates = (index, total) => {
  const labelRadius = RADIUS + 70; // Push further out
  const angle = (index / total) * 2 * Math.PI - (Math.PI / 2);
  return {
    x: CENTER_X + labelRadius * Math.cos(angle),
    y: CENTER_Y + labelRadius * Math.sin(angle),
    degrees: (angle * 180) / Math.PI + 90 // Rotation for arrow
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

export default function CircularDoublyLinkedListVisualizer() {
  // --- STATE ---
  const [list, setList] = useState([]);
  const [inputValue, setInputValue] = useState('');
  
  // Animation
  const [pointers, setPointers] = useState({ current: -1, delete: -1 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState('List is empty.');
  const [codeLines, setCodeLines] = useState(["// Circular Doubly Linked List"]);
  const [activeLine, setActiveLine] = useState(-1);

  // --- OPERATIONS ---

  const handleAutoFill = () => {
    if (isAnimating) return;
    const sampleData = [10, 20, 30, 40, 50];
    const newNodes = sampleData.map((val, i) => ({ id: Date.now() + i, val }));
    setList(newNodes);
    setMessage("Auto-filled circular doubly list.");
  };

  const insertHead = async () => {
    if (isAnimating || !inputValue) { setMessage("Enter value."); return; }
    setIsAnimating(true);
    setMessage(`Inserting "${inputValue}" at Head...`);
    setCodeLines([
      `newNode = new Node(${inputValue})`,
      `if head == null:`,
      `   head = newNode; head.next = head; head.prev = head`,
      `else:`,
      `   tail = head.prev`,
      `   newNode.next = head; head.prev = newNode`,
      `   newNode.prev = tail; tail.next = newNode`,
      `   head = newNode`
    ]);

    setActiveLine(0); await sleep(ANIMATION_SPEED);

    if (list.length === 0) {
        setActiveLine(1); await sleep(500);
        setActiveLine(2);
        const newNode = { id: Date.now(), val: inputValue };
        setList([newNode]);
        setMessage("List init: Head points to self (Next & Prev).");
    } else {
        setActiveLine(3); await sleep(500);
        setActiveLine(4);
        setMessage("Identifying Tail (Head.prev)...");
        await sleep(ANIMATION_SPEED);

        setActiveLine(5);
        setMessage("Linking NewNode <-> Head...");
        await sleep(ANIMATION_SPEED);

        setActiveLine(6);
        setMessage("Linking NewNode <-> Tail...");
        await sleep(ANIMATION_SPEED);

        setActiveLine(7);
        const newNode = { id: Date.now(), val: inputValue };
        setList([newNode, ...list]);
        setMessage("Head updated. Circular Links maintained.");
    }
    
    setInputValue('');
    await sleep(ANIMATION_SPEED);
    setIsAnimating(false); setActiveLine(-1);
  };

  const insertTail = async () => {
    if (isAnimating || !inputValue) { setMessage("Enter value."); return; }
    setIsAnimating(true);
    setMessage("Inserting at Tail...");
    setCodeLines([
      `newNode = new Node(${inputValue})`,
      `if head == null: init_list()`,
      `else:`,
      `   tail = head.prev`,
      `   tail.next = newNode; newNode.prev = tail`,
      `   newNode.next = head; head.prev = newNode`
    ]);

    setActiveLine(0); await sleep(ANIMATION_SPEED);

    if (list.length === 0) {
        setActiveLine(1);
        setList([{ id: Date.now(), val: inputValue }]);
        setMessage("List init: Head points to self.");
    } else {
        setActiveLine(2); await sleep(500);
        setActiveLine(3);
        setMessage("Tail is Head.prev (O(1) access).");
        await sleep(ANIMATION_SPEED);

        setActiveLine(4);
        setMessage("Linking Tail -> NewNode -> Tail...");
        await sleep(ANIMATION_SPEED);

        setActiveLine(5);
        const newNode = { id: Date.now(), val: inputValue };
        setList([...list, newNode]);
        setMessage("Inserted at Tail. Cycle maintained.");
    }

    setInputValue('');
    await sleep(ANIMATION_SPEED);
    setIsAnimating(false); setActiveLine(-1);
  };

  const deleteHead = async () => {
    if (isAnimating || list.length === 0) return;
    setIsAnimating(true);
    setCodeLines([
      `if head.next == head: head = null`,
      `else:`,
      `   tail = head.prev`,
      `   head = head.next`,
      `   head.prev = tail; tail.next = head`
    ]);

    setActiveLine(0);
    setPointers({ delete: 0 }); 
    await sleep(ANIMATION_SPEED);

    if (list.length === 1) {
        setList([]);
        setMessage("List empty.");
    } else {
        setActiveLine(1); await sleep(500);
        setActiveLine(2);
        setMessage("Identifying Tail...");
        await sleep(ANIMATION_SPEED);

        setActiveLine(3);
        setMessage("Moving Head forward...");
        await sleep(ANIMATION_SPEED);

        setActiveLine(4);
        setList(list.slice(1));
        setMessage("Head removed. Tail re-linked to new Head.");
    }

    setPointers({ delete: -1 });
    await sleep(ANIMATION_SPEED);
    setIsAnimating(false); setActiveLine(-1);
  };

  const deleteTail = async () => {
    if (isAnimating || list.length === 0) return;
    setIsAnimating(true);
    setCodeLines([
      `if head.next == head: head = null`,
      `else:`,
      `   tail = head.prev`,
      `   newTail = tail.prev`,
      `   newTail.next = head; head.prev = newTail`,
      `   free(tail)`
    ]);

    setActiveLine(0);
    if (list.length === 1) {
        setList([]);
        setIsAnimating(false); setActiveLine(-1);
        return;
    }

    setActiveLine(2);
    setPointers({ delete: list.length - 1 });
    setMessage("Identifying Tail...");
    await sleep(ANIMATION_SPEED);

    setActiveLine(3);
    setMessage("Identifying New Tail (Tail.prev)...");
    await sleep(ANIMATION_SPEED);

    setActiveLine(4);
    setMessage("Updating pointers to skip old Tail...");
    await sleep(ANIMATION_SPEED);

    setActiveLine(5);
    setList(list.slice(0, -1));
    setMessage("Tail removed. Cycle maintained.");

    setPointers({ delete: -1 });
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
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            Circular Doubly Linked List
            </h1>
            <p className="text-xs text-slate-500 mt-1">Bidirectional Ring (Head ↔ ... ↔ Tail ↔ Head)</p>
        </div>
        <div className="w-24"></div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- LEFT: VISUALIZER --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STAGE CONTAINER */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 min-h-[550px] flex flex-col relative overflow-hidden shadow-2xl">
            
            {/* Legend */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-[#0f172a]/90 p-3 rounded-lg border border-[#334155] text-[10px] shadow-lg">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                    <div className="w-8 h-[2px] bg-blue-400"></div> Next (CW)
                </div>
                <div className="flex items-center gap-2 text-orange-400 font-bold">
                    <div className="w-8 h-[2px] bg-orange-400"></div> Prev (CCW)
                </div>
            </div>

            {/* Live Message */}
            <div className="absolute top-4 right-0 left-0 mx-auto w-fit z-20">
               <motion.span 
                 key={message}
                 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                 className="bg-[#0f172a]/90 px-4 py-1.5 rounded-full border border-[#6366f1]/30 text-xs font-mono text-[#a5a6f6]"
               >
                 {message}
               </motion.span>
            </div>

            {/* --- SVG & NODES LAYER --- */}
            <div className="flex-1 relative flex items-center justify-center">
                
                {/* 1. CURVED ARROWS LAYER */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <defs>
                        <marker id="arrowNext" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                           <polygon points="0 0, 10 3.5, 0 7" fill="#60a5fa" />
                        </marker>
                        <marker id="arrowPrev" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                           <polygon points="0 0, 10 3.5, 0 7" fill="#fb923c" />
                        </marker>
                    </defs>

                    {list.map((_, i) => {
                        const start = getCoordinates(i, list.length);
                        const endIdx = (i + 1) % list.length; 
                        const end = getCoordinates(endIdx, list.length);
                        
                        // Self Loop for 1 node
                        if (list.length === 1) {
                            return (
                                <g key={i}>
                                    {/* Outer Loop (Next) */}
                                    <path d={`M ${start.x + 30} ${start.y} C ${start.x + 100} ${start.y - 80}, ${start.x + 100} ${start.y + 80}, ${start.x + 30} ${start.y + 10}`} stroke="#60a5fa" strokeWidth="2" fill="none" markerEnd="url(#arrowNext)" />
                                    {/* Inner Loop (Prev) */}
                                    <path d={`M ${start.x - 30} ${start.y} C ${start.x - 100} ${start.y + 80}, ${start.x - 100} ${start.y - 80}, ${start.x - 30} ${start.y - 10}`} stroke="#fb923c" strokeWidth="2" fill="none" markerEnd="url(#arrowPrev)" />
                                </g>
                            );
                        }

                        // CURVE MATH
                        const midX = (start.x + end.x) / 2;
                        const midY = (start.y + end.y) / 2;
                        
                        const vecX = midX - CENTER_X;
                        const vecY = midY - CENTER_Y;
                        const len = Math.sqrt(vecX*vecX + vecY*vecY);
                        const normX = vecX / len;
                        const normY = vecY / len;

                        // Control Points
                        const ctrlOutX = midX + normX * 50; // Push OUT for Next
                        const ctrlOutY = midY + normY * 50;
                        
                        const ctrlInX = midX - normX * 50; // Push IN for Prev
                        const ctrlInY = midY - normY * 50;

                        return (
                            <g key={i}>
                                {/* NEXT (Blue) - Outer Curve */}
                                <path 
                                    d={`M ${start.x} ${start.y} Q ${ctrlOutX} ${ctrlOutY} ${end.x} ${end.y}`}
                                    stroke="#60a5fa" strokeWidth="2" fill="none" opacity="0.6"
                                    markerEnd="url(#arrowNext)"
                                />
                                {/* PREV (Orange) - Inner Curve - Reversed Direction (End -> Start) */}
                                <path 
                                    d={`M ${end.x} ${end.y} Q ${ctrlInX} ${ctrlInY} ${start.x} ${start.y}`}
                                    stroke="#fb923c" strokeWidth="2" fill="none" opacity="0.6"
                                    markerEnd="url(#arrowPrev)"
                                />
                            </g>
                        );
                    })}
                </svg>

                {/* 2. NODES & LABELS LAYER */}
                <AnimatePresence>
                    {list.length === 0 && <div className="text-slate-600 font-mono text-sm">List is Empty</div>}
                    {list.map((node, i) => {
                        const coords = getCoordinates(i, list.length);
                        const labelCoords = getLabelCoordinates(i, list.length);
                        
                        let borderColor = 'border-[#334155]';
                        let bgColor = 'bg-[#1e293b]';
                        
                        if (pointers.delete === i) {
                            borderColor = 'border-red-500'; bgColor = 'bg-red-500/20';
                        } else if (i === 0) {
                            borderColor = 'border-emerald-500'; // Head Node
                        } else if (i === list.length - 1) {
                            borderColor = 'border-blue-500'; // Tail Node
                        }

                        return (
                            <React.Fragment key={node.id}>
                                {/* Node Circle */}
                                <motion.div
                                    layout
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1, x: coords.x - CENTER_X, y: coords.y - CENTER_Y }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className={`absolute w-14 h-14 rounded-full flex items-center justify-center border-2 text-white font-bold text-sm shadow-xl z-10 ${borderColor} ${bgColor}`}
                                    style={{ top: CENTER_Y - 28, left: CENTER_X - 28 }}
                                >
                                    {node.val}
                                    <div className="absolute -bottom-5 text-[8px] text-slate-500 font-mono">#{i}</div>
                                </motion.div>

                                {/* HEAD Label (Floating Outside) */}
                                {i === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="absolute z-20 flex flex-col items-center"
                                        style={{ 
                                            left: labelCoords.x - 20, // Center the div width
                                            top: labelCoords.y - 20,
                                            transform: `rotate(${labelCoords.degrees}deg)` 
                                        }}
                                    >
                                        <div className="text-[10px] font-bold text-emerald-400 bg-[#0f172a] border border-emerald-500/50 px-2 py-0.5 rounded mb-1">HEAD</div>
                                        <ArrowDown size={16} className="text-emerald-400" />
                                    </motion.div>
                                )}

                                {/* TAIL Label (Floating Outside) */}
                                {i === list.length - 1 && list.length > 1 && (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="absolute z-20 flex flex-col items-center"
                                        style={{ 
                                            left: labelCoords.x - 20, 
                                            top: labelCoords.y - 20,
                                            transform: `rotate(${labelCoords.degrees}deg)`
                                        }}
                                    >
                                        <div className="text-[10px] font-bold text-blue-400 bg-[#0f172a] border border-blue-500/50 px-2 py-0.5 rounded mb-1">TAIL</div>
                                        <ArrowDown size={16} className="text-blue-400" />
                                    </motion.div>
                                )}
                            </React.Fragment>
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

        {/* --- RIGHT: CODE --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 h-full shadow-lg">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-white font-bold flex items-center gap-2 text-sm"><Play size={16} className="text-blue-400"/> Logic Trace</h3>
               <span className="text-[10px] bg-[#0f172a] px-2 py-1 rounded text-slate-500">Mode: Circ-Doubly</span>
            </div>
            
            <CodeViewer lines={codeLines} activeLine={activeLine} />
            
            <div className="mt-6 p-4 bg-[#0f172a] rounded-xl border border-[#334155]">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3 border-b border-[#334155] pb-2">Properties</h4>
              <ul className="text-[10px] text-blue-400 space-y-2 font-mono">
                  <li className="flex items-start gap-2"><ArrowRight size={12} className="mt-0.5 text-blue-400"/> Tail.next points to Head</li>
                  <li className="flex items-start gap-2"><ArrowLeft size={12} className="mt-0.5 text-orange-400"/> Head.prev points to Tail</li>
                  <li className="flex items-start gap-2"><span>•</span> O(1) Access to Start/End</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
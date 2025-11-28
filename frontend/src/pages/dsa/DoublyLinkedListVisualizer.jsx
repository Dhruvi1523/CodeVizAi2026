import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, RotateCcw, Play, 
  Zap, ArrowRight, CornerDownLeft, ArrowDown, ArrowUp 
} from 'lucide-react';

// --- CONFIG ---
const ANIMATION_SPEED = 900;
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

// Node Component
const DoublyNode = ({ val, index, isHead, isTail, highlightType }) => {
  const getStyles = () => {
    switch (highlightType) {
      case 'current': return 'border-yellow-400 bg-yellow-400/10 shadow-[0_0_15px_rgba(250,204,21,0.3)]';
      case 'delete': return 'border-red-500 bg-red-500/20 scale-90 opacity-80';
      case 'new': return 'border-blue-400 bg-blue-400/20';
      default: return 'border-[#334155] bg-[#1e293b]';
    }
  };

  return (
    <div className="flex items-center">
      
      {/* 1. PREV POINTER (Start Null) */}
      {isHead && (
        <div className="mr-3 flex flex-col items-center gap-1 opacity-40">
            <span className="text-[10px] text-slate-400 font-mono">NULL</span>
            <div className="h-[1px] w-6 bg-orange-400"></div>
            <ArrowLeft size={12} className="text-orange-400" />
        </div>
      )}

      {/* 2. THE NODE */}
      <div className="relative group mx-2">
        
        {/* Head Label */}
        {isHead && (
          <motion.div layoutId="head-label" className="absolute -top-12 left-0 right-0 flex flex-col items-center z-20">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-[#0f172a] px-2 py-0.5 rounded border border-emerald-500/30">Head</span>
            <ArrowDown size={16} className="text-emerald-400 mt-1" />
          </motion.div>
        )}

        {/* Tail Label */}
        {isTail && (
          <motion.div layoutId="tail-label" className="absolute -bottom-12 left-0 right-0 flex flex-col-reverse items-center z-20">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-[#0f172a] px-2 py-0.5 rounded border border-blue-500/30">Tail</span>
            <ArrowUp size={16} className="text-blue-400 mb-1" />
          </motion.div>
        )}

        {/* Main Box */}
        <motion.div 
          layout
          initial={{ scale: 0, y: -20 }} 
          animate={{ scale: 1, y: 0 }} 
          exit={{ scale: 0, opacity: 0 }}
          className={`w-28 h-16 border-2 rounded-xl flex overflow-hidden shadow-lg transition-colors duration-300 relative ${getStyles()}`}
        >
          {/* P - Prev */}
          <div className="w-1/4 bg-[#0f172a]/40 border-r border-[#334155] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
          </div>
          
          {/* Data */}
          <div className="w-2/4 flex items-center justify-center text-white font-bold text-lg z-10">
            {val}
          </div>
          
          {/* N - Next */}
          <div className="w-1/4 bg-[#0f172a]/40 border-l border-[#334155] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
          </div>

          <div className="absolute bottom-1 right-2 text-[8px] text-slate-500 font-mono">#{index}</div>
        </motion.div>
      </div>

      {/* 3. CONNECTIONS (Dual Arrows) */}
      {!isTail ? (
        <div className="px-1 flex flex-col gap-1 w-16">
            {/* Next Arrow (Blue) */}
            <div className="flex items-center text-blue-400 opacity-80">
                <div className="h-[2px] w-full bg-blue-400/50"></div>
                <ArrowRight size={14} className="-ml-1" />
            </div>
            {/* Prev Arrow (Orange) */}
            <div className="flex items-center text-orange-400 opacity-80">
                <ArrowLeft size={14} className="-mr-1" />
                <div className="h-[2px] w-full bg-orange-400/50"></div>
            </div>
        </div>
      ) : (
        /* 4. NEXT POINTER (End Null) */
        <div className="ml-3 flex flex-col items-center gap-1 opacity-40">
            <div className="flex items-center">
                <div className="h-[1px] w-6 bg-blue-400"></div>
                <ArrowRight size={12} className="text-blue-400" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">NULL</span>
        </div>
      )}

    </div>
  );
};

export default function DoublyLinkedListVisualizer() {
  // State
  const [list, setList] = useState([]);
  const [inputValue, setInputValue] = useState('');
  
  // Animation
  const [pointers, setPointers] = useState({ current: -1, delete: -1 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState('List is empty.');
  const [codeLines, setCodeLines] = useState(["// Doubly Linked List"]);
  const [activeLine, setActiveLine] = useState(-1);

  // Operations
  const handleAutoFill = () => {
    if (isAnimating) return;
    const sampleData = [10, 20, 30];
    const newNodes = sampleData.map((val, i) => ({ id: Date.now() + i, val }));
    setList(newNodes);
    setMessage("Auto-filled doubly list.");
  };

  const insertHead = async () => {
    if (isAnimating || !inputValue) { setMessage("Enter value."); return; }
    setIsAnimating(true);
    setMessage("Inserting Head...");
    setCodeLines([
      `newNode = new Node(${inputValue})`, 
      `if head != null: head.prev = newNode`, 
      `newNode.next = head`,
      `head = newNode`
    ]);

    setActiveLine(0); await sleep(ANIMATION_SPEED);

    if (list.length > 0) {
        setActiveLine(1);
        setMessage("Linking Old Head.prev to New Node...");
        await sleep(ANIMATION_SPEED);
    }

    setActiveLine(2);
    setMessage("Linking New Node.next to Old Head...");
    const newNode = { id: Date.now(), val: inputValue };
    setList([newNode, ...list]);
    
    setActiveLine(3);
    setInputValue('');
    setMessage("Head updated.");
    await sleep(ANIMATION_SPEED);
    setIsAnimating(false); setActiveLine(-1);
  };

  const insertTail = async () => {
    if (isAnimating || !inputValue) { setMessage("Enter value."); return; }
    setIsAnimating(true);
    setMessage("Inserting Tail...");
    setCodeLines([
      `newNode = new Node(${inputValue})`, 
      `if head == null: head = newNode`, 
      `curr = head; while(curr.next != null) curr = curr.next`,
      `curr.next = newNode; newNode.prev = curr`
    ]);

    setActiveLine(0); await sleep(ANIMATION_SPEED);

    if (list.length === 0) {
        setActiveLine(1);
        setList([{ id: Date.now(), val: inputValue }]);
        setMessage("Inserted at Head (List was empty).");
    } else {
        setActiveLine(2);
        for(let i=0; i<list.length; i++) {
            setPointers({ current: i });
            await sleep(300);
        }
        
        setActiveLine(3);
        const newNode = { id: Date.now(), val: inputValue };
        setList([...list, newNode]);
        setMessage("Tail updated. Pointers connected.");
    }

    setInputValue('');
    setPointers({ current: -1 });
    await sleep(ANIMATION_SPEED);
    setIsAnimating(false); setActiveLine(-1);
  };

  const deleteHead = async () => {
    if (isAnimating || list.length === 0) return;
    setIsAnimating(true);
    setCodeLines([
      `if head == null: return`, 
      `head = head.next`,
      `if head != null: head.prev = null`,
      `free(oldHead)`
    ]);

    setActiveLine(0);
    setPointers({ delete: 0 });
    await sleep(ANIMATION_SPEED);

    setActiveLine(1);
    const newList = list.slice(1);
    setList(newList);
    setMessage("Moved Head forward.");
    await sleep(ANIMATION_SPEED);

    if (newList.length > 0) {
        setActiveLine(2);
        setMessage("Set new Head.prev to NULL.");
        await sleep(ANIMATION_SPEED);
    }

    setPointers({ delete: -1 });
    setIsAnimating(false); setActiveLine(-1);
  };

  const deleteTail = async () => {
    if (isAnimating || list.length === 0) return;
    setIsAnimating(true);
    setCodeLines([
      `if head.next == null: head = null`, 
      `curr = head; while(curr.next != null) curr = curr.next`,
      `curr.prev.next = null`,
      `free(curr)`
    ]);

    if (list.length === 1) {
        setActiveLine(0);
        setList([]);
        setMessage("List cleared.");
        setIsAnimating(false); setActiveLine(-1);
        return;
    }

    setActiveLine(1);
    for(let i=0; i<list.length; i++) {
        setPointers({ current: i });
        await sleep(300);
    }

    setActiveLine(2);
    setPointers({ delete: list.length - 1, current: list.length - 2 });
    setMessage("Breaking connection from second-to-last node...");
    await sleep(ANIMATION_SPEED);

    setList(list.slice(0, -1));
    setMessage("Tail removed.");
    
    setPointers({ delete: -1, current: -1 });
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
            Doubly Linked List
            </h1>
            <p className="text-xs text-slate-500 mt-1">Linear Bidirectional (Next & Prev)</p>
        </div>
        <div className="w-24"></div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- LEFT: VISUALIZER --- */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 min-h-[350px] flex flex-col relative overflow-hidden shadow-2xl">
            
            {/* Legend */}
            <div className="absolute top-4 left-4 flex gap-4 text-[10px]">
                <div className="flex items-center gap-1 text-blue-400 font-bold"><div className="w-4 h-[2px] bg-blue-400"></div> Next</div>
                <div className="flex items-center gap-1 text-orange-400 font-bold"><div className="w-4 h-[2px] bg-orange-400"></div> Prev</div>
            </div>

            <div className="absolute top-4 right-0 left-0 mx-auto w-fit">
               <motion.span key={message} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0f172a]/90 px-4 py-1.5 rounded-full border border-[#6366f1]/30 text-xs font-mono text-[#a5a6f6]">
                 {message}
               </motion.span>
            </div>

            {/* List Render */}
            <div className="flex-1 flex items-center overflow-x-auto custom-scrollbar pt-12 pb-8 px-4 justify-start">
              <AnimatePresence mode='popLayout'>
                {list.length === 0 && <div className="w-full text-center text-slate-600 font-mono text-sm">List is Empty</div>}
                {list.map((node, index) => (
                  <DoublyNode 
                    key={node.id} 
                    {...node}
                    index={index}
                    isHead={index === 0}
                    isTail={index === list.length - 1}
                    highlightType={pointers.delete === index ? 'delete' : pointers.current === index ? 'current' : null}
                  />
                ))}
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
                <Plus size={14} /> Add Head
              </button>
              <button onClick={insertTail} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-emerald-600/20 text-emerald-400 border border-emerald-600/50 hover:bg-emerald-600/30 py-2.5 rounded-xl text-xs font-bold transition-all">
                <CornerDownLeft size={14} /> Add Tail
              </button>
              <button onClick={deleteHead} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-red-600/10 text-red-400 border border-red-600/30 hover:bg-red-600/20 py-2.5 rounded-xl text-xs font-bold transition-all">
                <Trash2 size={14} /> Del Head
              </button>
              <button onClick={deleteTail} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-red-600/10 text-red-400 border border-red-600/30 hover:bg-red-600/20 py-2.5 rounded-xl text-xs font-bold transition-all">
                <Trash2 size={14} /> Del Tail
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
               <span className="text-[10px] bg-[#0f172a] px-2 py-1 rounded text-slate-500">Mode: Doubly</span>
            </div>
            
            <CodeViewer lines={codeLines} activeLine={activeLine} />
            
            <div className="mt-6 p-4 bg-[#0f172a] rounded-xl border border-[#334155]">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3 border-b border-[#334155] pb-2">Complexity</h4>
              <ul className="text-[10px] text-blue-400 space-y-2 font-mono">
                  <li className="flex justify-between"><span>Insert Head/Tail:</span> <span className="text-white">O(1)</span></li>
                  <li className="flex justify-between"><span>Delete Head/Tail:</span> <span className="text-white">O(1)</span></li>
                  <li className="flex justify-between"><span>Reverse:</span> <span className="text-white">O(n)</span></li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
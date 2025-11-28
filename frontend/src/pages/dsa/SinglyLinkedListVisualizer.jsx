import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, RotateCcw, Play, 
  ArrowRight, Search, Hash, CornerDownRight, XCircle, Zap
} from 'lucide-react';

// --- CONFIG ---
const ANIMATION_SPEED = 800; 
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- COMPONENTS ---

// 1. Code Viewer
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

// 2. Node Component
const ListNode = ({ id, val, next, index, isHead, highlightType }) => {
  const getStyles = () => {
    switch (highlightType) {
      case 'current': return 'border-yellow-400 bg-yellow-400/10 shadow-[0_0_15px_rgba(250,204,21,0.3)]';
      case 'found': return 'border-emerald-500 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.4)]';
      case 'delete': return 'border-red-500 bg-red-500/20 scale-90 opacity-80';
      case 'new': return 'border-blue-400 bg-blue-400/20';
      default: return 'border-[#334155] bg-[#1e293b]';
    }
  };

  return (
    <div className="flex items-center">
      <div className="relative group">
        
        {/* POINTER LABELS */}
        {isHead && (
          <motion.div layoutId="head-label" className="absolute -top-8 left-0 right-0 text-center text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
            Head
          </motion.div>
        )}
        {highlightType === 'current' && (
          <motion.div layoutId="curr-label" className="absolute -bottom-8 left-0 right-0 text-center text-yellow-400 text-[10px] font-bold uppercase tracking-wider">
            Curr
          </motion.div>
        )}

        {/* NODE BOX */}
        <motion.div 
          layout
          initial={{ scale: 0, y: -20 }} 
          animate={{ scale: 1, y: 0 }} 
          exit={{ scale: 0, opacity: 0 }}
          className={`w-24 h-14 border-2 rounded-xl flex overflow-hidden shadow-lg transition-colors duration-300 relative ${getStyles()}`}
        >
          {/* Data Section */}
          <div className="w-2/3 flex items-center justify-center text-white font-bold border-r border-[#334155]/50 z-10">
            {val}
          </div>
          
          {/* Next Pointer Section */}
          <div className="w-1/3 bg-[#0f172a]/50 flex items-center justify-center z-10">
            <div className={`w-2 h-2 rounded-full ${next === null ? 'bg-red-500' : 'bg-[#6366f1]'}`}></div>
          </div>

          {/* Index Watermark */}
          <div className="absolute top-1 left-2 text-[8px] text-slate-500 font-mono">
            #{index}
          </div>
        </motion.div>
      </div>

      {/* CONNECTION ARROW */}
      {next !== null ? (
        <div className="px-1 text-slate-600">
          <ArrowRight size={24} />
        </div>
      ) : (
        <div className="px-2 text-slate-600 text-xs font-mono opacity-50 flex items-center gap-1">
          <XCircle size={12} /> NULL
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function SinglyLinkedListVisualizer() {
  // State: Starts EMPTY now
  const [list, setList] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [inputIndex, setInputIndex] = useState('');
  
  // Animation State
  const [pointers, setPointers] = useState({ current: -1, found: -1, delete: -1 }); 
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState('List is empty. Add nodes to start.');
  const [codeLines, setCodeLines] = useState(["// Select an operation"]);
  const [activeLine, setActiveLine] = useState(-1);

  const getHighlight = (idx) => {
    if (pointers.delete === idx) return 'delete';
    if (pointers.found === idx) return 'found';
    if (pointers.current === idx) return 'current';
    return null;
  };

  // --- OPERATIONS ---

  // 0. AUTO FILL
  const handleAutoFill = () => {
    if (isAnimating) return;
    const sampleData = [10, 25, 40, 99];
    const newNodes = sampleData.map((val, i) => ({ id: Date.now() + i, val }));
    setList(newNodes);
    setMessage("Auto-filled list with sample data.");
  };

  // 1. INSERT HEAD
  const insertHead = async () => {
    if (isAnimating || !inputValue) { setMessage("Please enter a value."); return; }
    setIsAnimating(true);
    setMessage(`Creating Node(${inputValue})...`);
    setCodeLines([`newNode = new Node(${inputValue})`, `newNode.next = head`, `head = newNode`]);

    setActiveLine(0); await sleep(ANIMATION_SPEED);
    setActiveLine(1); await sleep(ANIMATION_SPEED);

    const newNode = { id: Date.now(), val: inputValue };
    setList([newNode, ...list]);
    
    setActiveLine(2); 
    setMessage(`Inserted ${inputValue} at Head.`);
    setInputValue('');
    
    await sleep(ANIMATION_SPEED);
    setIsAnimating(false); setActiveLine(-1);
  };

  // 2. INSERT TAIL
  const insertTail = async () => {
    if (isAnimating || !inputValue) { setMessage("Please enter a value."); return; }
    setIsAnimating(true);
    setMessage("Traversing to last node...");
    setCodeLines([`newNode = new Node(${inputValue})`, `curr = head`, `while(curr.next != null) curr = curr.next`, `curr.next = newNode`]);

    setActiveLine(0); await sleep(ANIMATION_SPEED);

    if (list.length === 0) {
       setList([{ id: Date.now(), val: inputValue }]);
       setMessage("List was empty. Inserted at Head.");
       setIsAnimating(false); setActiveLine(-1); setInputValue('');
       return;
    }

    setActiveLine(1);
    setPointers({ ...pointers, current: 0 });
    await sleep(ANIMATION_SPEED);

    setActiveLine(2);
    for (let i = 0; i < list.length - 1; i++) {
        setPointers({ ...pointers, current: i + 1 });
        await sleep(ANIMATION_SPEED);
    }

    setActiveLine(3);
    const newNode = { id: Date.now(), val: inputValue };
    setList([...list, newNode]);
    setMessage(`Appended ${inputValue} to Tail.`);
    setInputValue('');
    setPointers({ current: -1 });

    await sleep(ANIMATION_SPEED);
    setIsAnimating(false); setActiveLine(-1);
  };

  // 3. INSERT AT INDEX
  const insertAtIndex = async () => {
    if (isAnimating || !inputValue || !inputIndex) { setMessage("Enter Value & Index."); return; }
    const idx = parseInt(inputIndex);
    if (idx < 0 || idx > list.length) { setMessage("Index out of bounds."); return; }

    if (idx === 0) { await insertHead(); return; }
    if (idx === list.length) { await insertTail(); return; }

    setIsAnimating(true);
    setMessage(`Traversing to index ${idx - 1}...`);
    setCodeLines([`newNode = new Node(${inputValue})`, `curr = head`, `for(i=0; i<index-1; i++) curr = curr.next`, `newNode.next = curr.next`, `curr.next = newNode`]);

    setActiveLine(0); await sleep(ANIMATION_SPEED);
    
    setActiveLine(1);
    setPointers({ ...pointers, current: 0 });
    await sleep(ANIMATION_SPEED);

    setActiveLine(2);
    for (let i = 0; i < idx - 1; i++) {
        setPointers({ ...pointers, current: i + 1 });
        await sleep(ANIMATION_SPEED);
    }

    setActiveLine(3); await sleep(ANIMATION_SPEED);

    setActiveLine(4);
    const newNode = { id: Date.now(), val: inputValue };
    const newList = [...list];
    newList.splice(idx, 0, newNode);
    setList(newList);
    
    setMessage(`Inserted at Index ${idx}.`);
    setInputValue(''); setInputIndex('');
    setPointers({ current: -1 });

    await sleep(ANIMATION_SPEED);
    setIsAnimating(false); setActiveLine(-1);
  };

  // 4. DELETE AT INDEX
  const deleteAtIndex = async () => {
    if (isAnimating || !inputIndex) { setMessage("Enter Index."); return; }
    const idx = parseInt(inputIndex);
    if (idx < 0 || idx >= list.length) { setMessage("Index out of bounds."); return; }

    setIsAnimating(true);
    
    if (idx === 0) {
        setMessage("Deleting Head...");
        setCodeLines([`temp = head`, `head = head.next`, `free(temp)`]);
        setActiveLine(0);
        setPointers({ ...pointers, delete: 0 });
        await sleep(ANIMATION_SPEED);
        
        setActiveLine(1);
        setList(list.slice(1));
        setPointers({ delete: -1 });
        await sleep(ANIMATION_SPEED);
        
        setIsAnimating(false); setActiveLine(-1);
        return;
    }

    setMessage(`Traversing to node before index ${idx}...`);
    setCodeLines([`curr = head`, `while(i < index - 1) curr = curr.next`, `toDelete = curr.next`, `curr.next = toDelete.next`]);

    setActiveLine(0);
    setPointers({ ...pointers, current: 0 });
    await sleep(ANIMATION_SPEED);

    setActiveLine(1);
    for (let i = 0; i < idx - 1; i++) {
        setPointers({ ...pointers, current: i + 1 });
        await sleep(ANIMATION_SPEED);
    }

    setActiveLine(2);
    setMessage("Identifying node to delete...");
    setPointers({ current: idx - 1, delete: idx });
    await sleep(ANIMATION_SPEED);

    setActiveLine(3);
    const newList = [...list];
    newList.splice(idx, 1);
    setList(newList);
    setMessage(`Deleted node at index ${idx}.`);
    
    setPointers({ current: -1, delete: -1 });
    setInputIndex('');

    await sleep(ANIMATION_SPEED);
    setIsAnimating(false); setActiveLine(-1);
  };

  // 5. SEARCH VALUE
  const searchValue = async () => {
    if (isAnimating || !inputValue) return;
    setIsAnimating(true);
    setMessage(`Searching for "${inputValue}"...`);
    setCodeLines([`curr = head`, `while(curr != null)`, `  if(curr.val == key) return found`, `  curr = curr.next`, `return not_found`]);

    setActiveLine(0);
    setPointers({ ...pointers, current: 0 });
    await sleep(ANIMATION_SPEED);

    setActiveLine(1);
    let found = false;
    for (let i = 0; i < list.length; i++) {
        setPointers({ ...pointers, current: i });
        setActiveLine(2);
        await sleep(ANIMATION_SPEED);

        if (list[i].val == inputValue) {
            setActiveLine(2);
            setPointers({ ...pointers, current: -1, found: i });
            setMessage(`Value found at Index ${i}!`);
            found = true;
            await sleep(1500); 
            break;
        }
        setActiveLine(3);
        await sleep(ANIMATION_SPEED/2);
    }

    if (!found) {
        setActiveLine(4);
        setMessage("Value not found in list.");
        await sleep(1000);
    }

    setPointers({ current: -1, found: -1 });
    setInputValue('');
    setIsAnimating(false); setActiveLine(-1);
  };

  const clearList = () => {
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
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
            Singly Linked List
            </h1>
            <p className="text-xs text-slate-500 mt-1">Nodes connected Unidirectionally</p>
        </div>
        <div className="w-24"></div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- LEFT: VISUALIZER (8 Cols) --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STAGE */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 min-h-[350px] flex flex-col relative overflow-hidden shadow-2xl">
            
            {/* Live Message */}
            <div className="absolute top-4 left-4 right-4 text-center">
               <motion.span 
                 key={message}
                 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                 className="bg-[#0f172a]/90 px-4 py-1.5 rounded-full border border-[#6366f1]/30 text-xs font-mono text-[#a5a6f6]"
               >
                 {message}
               </motion.span>
            </div>

            {/* List Render */}
            <div className="flex-1 flex items-center overflow-x-auto custom-scrollbar pt-12 pb-8 px-4">
              <AnimatePresence mode='popLayout'>
                {list.length === 0 && (
                   <div className="w-full text-center text-slate-600 font-mono text-sm">Head -&gt; NULL (List Empty)</div>
                )}
                {list.map((node, index) => (
                  <ListNode 
                    key={node.id} 
                    {...node}
                    index={index}
                    next={index < list.length - 1 ? true : null}
                    isHead={index === 0}
                    highlightType={getHighlight(index)}
                  />
                ))}
              </AnimatePresence>
            </div>
            
            {/* Legend */}
            <div className="flex gap-4 justify-center mt-4 border-t border-[#334155] pt-3 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Traversal</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Found</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Delete</div>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6">
            
            {/* Input Row */}
            <div className="flex gap-3 mb-6">
              <input 
                value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                placeholder="Value (e.g. 42)" disabled={isAnimating}
                className="flex-1 bg-[#0f172a] border border-[#334155] text-white px-4 py-2.5 rounded-xl text-sm focus:border-emerald-500 outline-none transition-colors"
              />
              <input 
                type="number"
                value={inputIndex} onChange={(e) => setInputIndex(e.target.value)}
                placeholder="Index (Optional)" disabled={isAnimating}
                className="w-32 bg-[#0f172a] border border-[#334155] text-white px-4 py-2.5 rounded-xl text-sm focus:border-emerald-500 outline-none transition-colors"
              />
            </div>

            {/* Operations Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button onClick={insertHead} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-emerald-600/20 text-emerald-400 border border-emerald-600/50 hover:bg-emerald-600/30 py-2.5 rounded-xl text-xs font-bold transition-all">
                <Plus size={14} /> Insert Head
              </button>
              <button onClick={insertTail} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-emerald-600/20 text-emerald-400 border border-emerald-600/50 hover:bg-emerald-600/30 py-2.5 rounded-xl text-xs font-bold transition-all">
                <CornerDownRight size={14} /> Insert Tail
              </button>
              <button onClick={insertAtIndex} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-blue-600/20 text-blue-400 border border-blue-600/50 hover:bg-blue-600/30 py-2.5 rounded-xl text-xs font-bold transition-all">
                <Hash size={14} /> Insert @ Idx
              </button>
              <button onClick={searchValue} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-yellow-600/20 text-yellow-400 border border-yellow-600/50 hover:bg-yellow-600/30 py-2.5 rounded-xl text-xs font-bold transition-all">
                <Search size={14} /> Search Val
              </button>

              <button onClick={deleteAtIndex} disabled={isAnimating} className="col-span-1 md:col-span-2 flex items-center justify-center gap-2 bg-red-600/10 text-red-400 border border-red-600/30 hover:bg-red-600/20 py-2.5 rounded-xl text-xs font-bold transition-all">
                <Trash2 size={14} /> Delete @ Index
              </button>
              
              <button onClick={handleAutoFill} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-purple-600/20 text-purple-400 border border-purple-600/50 hover:bg-purple-600/30 py-2.5 rounded-xl text-xs font-bold transition-all">
                <Zap size={14} /> Auto Fill
              </button>

              <button onClick={clearList} disabled={isAnimating} className="flex items-center justify-center gap-2 bg-slate-700/30 text-slate-400 border border-slate-600/50 hover:bg-slate-700/50 py-2.5 rounded-xl text-xs font-bold transition-all">
                <RotateCcw size={14} /> Clear List
              </button>
            </div>
          </div>
        </div>

        {/* --- RIGHT: CODE (4 Cols) --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 h-full shadow-lg">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-white font-bold flex items-center gap-2 text-sm"><Play size={16} className="text-emerald-400"/> Logic Trace</h3>
               <span className="text-[10px] bg-[#0f172a] px-2 py-1 rounded text-slate-500">Speed: Slow</span>
            </div>
            
            <CodeViewer lines={codeLines} activeLine={activeLine} />
            
            <div className="mt-6 p-4 bg-[#0f172a] rounded-xl border border-[#334155]">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3 border-b border-[#334155] pb-2">Node Structure (C++)</h4>
              <pre className="text-[10px] text-emerald-400 font-mono leading-relaxed">
{`struct Node {
    int data;
    Node* next;
};`}
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
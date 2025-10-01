import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowDownCircle, ArrowUpCircle, ChevronLeft, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Visual Node Sub-component (Upgraded with Framer Motion & Arrows) ---
const VisualNode = ({ value, isLast, listType }) => {
  // Arrow component for connecting nodes
  const Arrow = () => {
    let arrowSymbol = "→";
    if (listType === 'doubly') arrowSymbol = "⇄";
    if (isLast && listType === 'circular') arrowSymbol = "↻";
    if (isLast && (listType === 'singly' || listType === 'doubly')) return null;

    return (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`text-2xl font-light mx-2 ${isLast && listType === 'circular' ? 'text-[#14b8a6]' : 'text-[#94a3b8]'}`}
      >
        {arrowSymbol}
      </motion.span>
    );
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="flex items-center"
    >
      <div className="bg-[#8b5cf6] text-[#f1f5f9] text-center px-4 py-3 rounded-lg font-bold text-lg shadow-lg flex-shrink-0">
        {value}
      </div>
      <Arrow />
    </motion.div>
  );
};

// --- Main Visualizer Component ---
export default function LinkedListVisualizer() {
  const [nodes, setNodes] = useState([]);
  const [value, setValue] = useState("");
  const [index, setIndex] = useState("");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [listType, setListType] = useState("singly");
  const [selectedCode, setSelectedCode] = useState("Select an operation to see code...");
  const [lineExplanation, setLineExplanation] = useState("Idle...");

  const nextId = useRef(1);

  const addHistory = (type, val) => {
    setHistory((prev) => [{ type, val, id: Date.now() }, ...prev.slice(0, 9)]);
  };

  const showCode = (operation) => {
    const codeSnippets = {
      insertHead: {
        code: `def insertHead(value):
            newNode = Node(value)
            newNode.next = head
            head = newNode`,
        explanation: "Create new node, link its next to current head, update head pointer."
      },
      insertTail: {
        code: `def insertTail(value):
            newNode = Node(value)
            if head is None:
                head = newNode
                return
            temp = head
            while temp.next:
                temp = temp.next
            temp.next = newNode`,
        explanation: "Traverse to end and attach new node."
      },
      insertIndex: {
        code: `def insertAtIndex(value, index):
            newNode = Node(value)
            if index == 0:
                insertHead(value)
                return
            temp = head
            for i in range(index-1):
                temp = temp.next
            newNode.next = temp.next
            temp.next = newNode`,
        explanation: "Traverse to (index-1), link new node between nodes."
      },
      deleteHead: {
        code: `def deleteHead():
            if head is None:
                return
            temp = head
            head = head.next
            del temp`,
        explanation: "Move head to next and delete old head."
      },
      deleteTail: {
        code: `def deleteTail():
            if head is None:
                return
            if head.next is None:
                head = None
                return
            temp = head
            while temp.next.next:
                temp = temp.next
            temp.next = None`,
        explanation: "Traverse to second last node, remove reference to last."
      },
      deleteIndex: {
        code: `def deleteAtIndex(index):
            if head is None:
                return
            if index == 0:
                deleteHead()
                return
            temp = head
            for i in range(index-1):
                temp = temp.next
            nodeToDelete = temp.next
            temp.next = nodeToDelete.next
            del nodeToDelete`,
        explanation: "Traverse to (index-1), unlink and delete node."
      },
      reverse: {
        code: `def reverseList():
            prev = None
            curr = head
            while curr:
                nxt = curr.next
                curr.next = prev
                prev = curr
                curr = nxt
            head = prev`,
        explanation: "Iteratively reverse all pointers."
      },
      reset: {
        code: `def resetList():
            head = None`,
        explanation: "Clear entire linked list by setting head = None."
      }
    };

    setSelectedCode(codeSnippets[operation]?.code || "Not implemented");
    setLineExplanation(codeSnippets[operation]?.explanation || "...");
  };

  /** ---------------- Insert/Delete Operations ---------------- **/
  const insertHead = () => {
    if (!value.trim()) return setMessage("Enter a value.");
    const node = { id: nextId.current++, value: value.trim() };
    setNodes([node, ...nodes]);
    setValue("");
    addHistory("insertHead", node.value);
    showCode("insertHead");
  };

  const insertTail = () => {
    if (!value.trim()) return setMessage("Enter a value.");
    const node = { id: nextId.current++, value: value.trim() };
    setNodes([...nodes, node]);
    setValue("");
    addHistory("insertTail", node.value);
    showCode("insertTail");
  };

  const insertAtIndex = () => {
    if (!value.trim() || index === "") return setMessage("Enter value and index.");
    const idx = parseInt(index);
    if (idx < 0 || idx > nodes.length) return setMessage("Invalid index.");
    const node = { id: nextId.current++, value: value.trim() };
    const newNodes = [...nodes];
    newNodes.splice(idx, 0, node);
    setNodes(newNodes);
    setValue("");
    setIndex("");
    addHistory("insertIndex", `${node.value} at ${idx}`);
    showCode("insertIndex");
  };

  const deleteHead = () => {
    if (nodes.length === 0) return setMessage("List is empty.");
    const removed = nodes[0];
    setNodes(nodes.slice(1));
    addHistory("deleteHead", removed.value);
    showCode("deleteHead");
  };

  const deleteTail = () => {
    if (nodes.length === 0) return setMessage("List is empty.");
    const removed = nodes[nodes.length - 1];
    setNodes(nodes.slice(0, -1));
    addHistory("deleteTail", removed.value);
    showCode("deleteTail");
  };

  const deleteAtIndex = () => {
    if (index === "") return setMessage("Enter index.");
    const idx = parseInt(index);
    if (idx < 0 || idx >= nodes.length) return setMessage("Invalid index.");
    const removed = nodes[idx];
    const newNodes = [...nodes];
    newNodes.splice(idx, 1);
    setNodes(newNodes);
    setIndex("");
    addHistory("deleteIndex", `${removed.value} at ${idx}`);
    showCode("deleteIndex");
  };

  const handleReverse = () => {
    if (nodes.length === 0) return setMessage("List is empty — cannot reverse.");
    setNodes([...nodes].reverse());
    addHistory("reverse", "list");
    showCode("reverse");
  };

  const handleReset = () => {
    setNodes([]);
    setHistory([]);
    showCode("reset");
  };

  /** ---------------- Visual Node ---------------- **/
  const VisualNode = ({ node, idx }) => {
    const curr = node.value;
    const prev = idx > 0 ? nodes[idx - 1].value : "NULL";
    const next = idx < nodes.length - 1 ? nodes[idx + 1].value : listType.includes("circular") ? nodes[0].value : "NULL";

    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-col bg-gradient-to-b from-purple-600 to-purple-400 shadow-lg text-white p-3 rounded-lg min-w-[100px]">
          <div><strong>CURR:</strong> {curr}</div>
          {(listType.includes("doubly") || listType.includes("circular-doubly")) && <div><strong>PREV:</strong> {prev}</div>}
          <div><strong>NEXT:</strong> {next}</div>
        </div>
        {idx !== nodes.length - 1 && <span className="text-xl text-gray-300 animate-pulse">→</span>}
        {idx === nodes.length - 1 && listType.includes("circular") && <span className="text-green-400 text-2xl animate-spin">↻</span>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center p-8 text-white">
      <h1 className="text-4xl font-extrabold mb-6">Linked List Visualizer</h1>

      {/* Main Container */}
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl">

        {/* Left Panel - Visualizer & Controls */}
        <div className="flex-1 flex flex-col gap-6">

          {/* List Type Selector */}
          <div className="flex flex-wrap gap-3 mb-4">
            {["singly", "doubly", "circular-singly", "circular-doubly"].map(t => (
              <button
                key={t}
                onClick={() => setListType(t)}
                className={`px-4 py-2 rounded font-medium transition-colors ${listType === t ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"}`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Input & Operations */}
          <div className="flex flex-wrap gap-3 items-center">
            <input type="text" placeholder="Value" className="px-3 py-2 rounded bg-gray-700 text-white flex-1" value={value} onChange={e => setValue(e.target.value)} />
            <input type="number" placeholder="Index" className="px-3 py-2 rounded bg-gray-700 text-white w-24" value={index} onChange={e => setIndex(e.target.value)} />
            <button onClick={insertHead} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500">Insert Head</button>
            <button onClick={insertTail} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500">Insert Tail</button>
            <button onClick={insertAtIndex} className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-500">Insert at Index</button>
            <button onClick={deleteHead} className="px-4 py-2 bg-red-600 rounded hover:bg-red-500">Delete Head</button>
            <button onClick={deleteTail} className="px-4 py-2 bg-red-600 rounded hover:bg-red-500">Delete Tail</button>
            <button onClick={deleteAtIndex} className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-500">Delete at Index</button>
          </div>

          {/* Linked List Visualization */}
          <div className="flex items-center gap-4 bg-[#111827] p-6 rounded-xl overflow-x-auto shadow-inner">
            <div className="px-3 py-2 bg-gray-400 text-black font-bold rounded">HEAD</div>
            <span className="text-xl">→</span>
            {nodes.length === 0 ? <div className="text-gray-500">Empty List</div> : nodes.map((n, idx) => <VisualNode key={n.id} node={n} idx={idx} />)}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button onClick={handleReverse} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded">
              <RefreshCcw className="w-5 h-5" /> Reverse
            </button>
            <button onClick={handleReset} className="flex-1 bg-red-500 hover:bg-red-400 px-4 py-2 rounded">Reset</button>
          </div>

          {/* History */}
          <div className="mt-6 bg-[#111827] border border-gray-800 rounded-lg p-4 shadow-inner">
            <h4 className="text-lg font-semibold mb-3">Operation History</h4>
            {history.length === 0 ? <p className="text-gray-500">No operations yet.</p> :
              <ul className="space-y-1 text-sm">
                {history.map(h => (
                  <li key={h.id} className="flex items-center gap-2">
                    {h.type.includes("insert") ? <ArrowDownCircle className="text-green-400 w-4 h-4" /> :
                      h.type.includes("delete") ? <ArrowUpCircle className="text-red-400 w-4 h-4" /> :
                        <RefreshCcw className="text-yellow-400 w-4 h-4" />}
                    <span>{h.type}: {h.val}</span>
                  </li>
                ))}
              </ul>}
          </div>
        </div>

        {/* Right Panel - Code Display */}
        <div className="w-full lg:w-1/3 bg-[#111827] border border-gray-800 rounded-lg p-4 shadow-lg flex flex-col">
          <h2 className="text-xl font-bold mb-3">Linked List Code</h2>
          <pre className="bg-black text-green-400 p-4 rounded flex-1 overflow-x-auto text-sm">{selectedCode}</pre>
          <div className="mt-3 text-gray-300">
            <strong>Line Explanation:</strong> {lineExplanation}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useRef, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, RefreshCcw } from "lucide-react";

export default function LinkedListVisualizer() {
  const [nodes, setNodes] = useState([]);
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const [listType, setListType] = useState("singly"); // singly | doubly | circular
  const nextId = useRef(1);
  const ANIM_MS = 300;

  const size = nodes.length;

  const addHistory = (type, val) => {
    setHistory((prev) => [{ type, val, id: Date.now() }, ...prev]);
  };

  // Insert at end
  const handleInsert = () => {
    if (!value.toString().trim()) {
      setMessage("Enter a value to insert.");
      return;
    }
    setMessage("");
    const id = nextId.current++;
    const node = { id, value: value.toString(), status: "enter" };
    setNodes((prev) => [...prev, node]);
    setIsBusy(true);

    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: "idle" } : n))
      );
      setIsBusy(false);
      addHistory("insert", node.value);
    }, ANIM_MS);

    setValue("");
  };

  // Delete from front
  const handleDelete = () => {
    if (nodes.length === 0) {
      setMessage("List is empty — nothing to delete.");
      return;
    }
    setMessage("");
    setIsBusy(true);
    const removed = nodes[0];
    setNodes((prev) =>
      prev.map((n, idx) => (idx === 0 ? { ...n, status: "leave" } : n))
    );

    setTimeout(() => {
      setNodes((prev) => prev.slice(1));
      setIsBusy(false);
      addHistory("delete", removed.value);
    }, ANIM_MS);
  };

  // Reverse the linked list
  const handleReverse = () => {
    if (nodes.length === 0) {
      setMessage("List is empty — cannot reverse.");
      return;
    }
    setMessage("");
    setIsBusy(true);
    setTimeout(() => {
      setNodes((prev) => [...prev].reverse());
      setIsBusy(false);
      addHistory("reverse", "list");
    }, ANIM_MS);
  };

  // Reset list
  const handleReset = () => {
    setMessage("");
    if (nodes.length === 0) return;
    setNodes((prev) => prev.map((n) => ({ ...n, status: "leave" })));
    setIsBusy(true);
    setTimeout(() => {
      setNodes([]);
      setIsBusy(false);
      setHistory([]);
    }, ANIM_MS + 40);
  };

  function VisualNode({ node, isLast }) {
    const { value: v, status } = node;
    const baseStyle = {
      transition: `all ${ANIM_MS}ms cubic-bezier(.2,.9,.2,1)`,
      minWidth: 70,
      padding: "12px 0",
      margin: "6px",
      textAlign: "center",
      borderRadius: 8,
      fontWeight: 700,
      fontSize: 18,
      boxShadow: "0 4px 8px rgba(0,0,0,0.25)",
    };

    const style =
      status === "enter"
        ? { ...baseStyle, transform: "translateY(-14px)", opacity: 0 }
        : status === "leave"
        ? { ...baseStyle, transform: "translateY(14px)", opacity: 0 }
        : { ...baseStyle, transform: "translateY(0)", opacity: 1 };

    return (
      <div className="flex items-center gap-2">
        <div style={style} className="bg-purple-500 text-white">
          {v}
        </div>
        {/* Link Arrows depending on type */}
        {!isLast && (
          <>
            {listType === "singly" && (
              <span className="text-xl text-gray-300">→</span>
            )}
            {listType === "doubly" && (
              <span className="text-xl text-gray-300">⇄</span>
            )}
          </>
        )}
        {/* Circular link arrow if last node */}
        {isLast && listType === "circular" && (
          <span className="text-xl text-green-400">↻</span>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-8 text-white">
      <div className="max-w-7xl w-full">
        <h1 className="text-3xl font-extrabold mb-2 text-white">
          Linked List
        </h1>
        <h4 className="text-lg font-semibold text-gray-300">
          Supports Singly, Doubly, Circular, and Reverse.
        </h4>
        <br />

        {/* List Type Selector */}
        <div className="flex gap-3 mb-6">
          {["singly", "doubly", "circular"].map((t) => (
            <button
              key={t}
              onClick={() => setListType(t)}
              className={`px-4 py-2 rounded ${
                listType === t ? "bg-purple-600" : "bg-gray-700"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div
          className="bg-[#111827] max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start 
                     mt-6 px-8 py-6 rounded-xl"
        >
          {/* LINKED LIST VISUAL */}
          <div className="col-span-2 flex flex-col items-center">
            <div
              className="relative w-full min-h-[120px] flex flex-row items-center justify-start border border-gray-700 rounded-xl p-4 overflow-x-auto"
              aria-label="Linked list container"
            >
              {nodes.length === 0 ? (
                <div className="text-gray-400">Empty. Insert to add nodes.</div>
              ) : (
                nodes.map((n, idx) => (
                  <VisualNode
                    key={n.id}
                    node={n}
                    isLast={idx === nodes.length - 1}
                  />
                ))
              )}
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold">
                {listType.charAt(0).toUpperCase() + listType.slice(1)} Linked List
              </h3>
            </div>
          </div>

          {/* CONTROL / INFO PANEL */}
          <div className="bg-[#0b1220] border border-gray-800 rounded-xl p-6 shadow-lg">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Size:</span>
                <div className="bg-purple-600 px-3 py-1 rounded font-bold text-sm">
                  {size}
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="mt-4">
              <label className="block text-gray-300 text-sm mb-2">Element</label>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value"
                className="w-full px-3 py-2 rounded border border-gray-700 bg-[#071019] text-white focus:outline-none"
                disabled={isBusy}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleInsert}
                disabled={isBusy}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded disabled:opacity-50"
              >
                Insert
              </button>
              <button
                onClick={handleDelete}
                disabled={isBusy}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded disabled:opacity-50"
              >
                Delete
              </button>
            </div>
            <div className="flex gap-3 mt-3">
              <button
                onClick={handleReverse}
                disabled={isBusy}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <RefreshCcw className="w-4 h-4" /> Reverse
              </button>
              <button
                onClick={handleReset}
                disabled={isBusy}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded disabled:opacity-50"
              >
                Reset
              </button>
            </div>

            {/* Message */}
            {message && <div className="mt-4 text-sm text-amber-400">{message}</div>}

            {/* Operation History */}
            <div className="mt-6 bg-[#111827] border border-gray-800 rounded-lg p-4">
              <h4 className="text-md font-semibold mb-3">Operation History</h4>
              {history.length === 0 ? (
                <p className="text-sm text-gray-500">No operations yet.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {history.map((h) => (
                    <li key={h.id} className="flex items-center gap-2">
                      {h.type === "insert" ? (
                        <ArrowDownCircle className="text-green-400 w-4 h-4" />
                      ) : h.type === "delete" ? (
                        <ArrowUpCircle className="text-red-400 w-4 h-4" />
                      ) : (
                        <RefreshCcw className="text-yellow-400 w-4 h-4" />
                      )}
                      <span>
                        {h.type.charAt(0).toUpperCase() + h.type.slice(1)}:{" "}
                        {h.val}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useRef, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export default function StackVisualizer() {
  const [nodes, setNodes] = useState([]); 
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [history, setHistory] = useState([]); // operation history
  const nextId = useRef(1);
  const ANIM_MS = 300;

  const top = nodes.length ? nodes[0].value : null;
  const size = nodes.length;

  const addHistory = (type, val) => {
    setHistory((prev) => [{ type, val, id: Date.now() }, ...prev]);
  };

  const handlePush = () => {
    if (!value.toString().trim()) {
      setMessage("Enter a value to push.");
      return;
    }
    setMessage("");
    const id = nextId.current++;
    const node = { id, value: value.toString(), status: "enter" };
    setNodes((prev) => [node, ...prev]);
    setIsBusy(true);

    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: "idle" } : n))
      );
      setIsBusy(false);
      addHistory("push", node.value);
    }, ANIM_MS);

    setValue("");
  };

  const handlePop = () => {
    if (nodes.length === 0) {
      setMessage("Stack is empty — nothing to pop.");
      return;
    }
    setMessage("");
    setIsBusy(true);
    const popped = nodes[0];
    setNodes((prev) =>
      prev.map((n, idx) => (idx === 0 ? { ...n, status: "leave" } : n))
    );

    setTimeout(() => {
      setNodes((prev) => prev.slice(1));
      setIsBusy(false);
      addHistory("pop", popped.value);
    }, ANIM_MS);
  };

  const handlePeek = () => {
    if (nodes.length === 0) {
      setMessage("Stack is empty.");
      return;
    }
    setMessage(`Top: ${nodes[0].value}`);
  };

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

  function VisualNode({ node }) {
    const { value: v, status } = node;
    const baseStyle = {
      transition: `all ${ANIM_MS}ms cubic-bezier(.2,.9,.2,1)`,
      width: 240,
      padding: "12px 0",
      margin: "6px 0",
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
        ? { ...baseStyle, transform: "translateY(-8px)", opacity: 0 }
        : { ...baseStyle, transform: "translateY(0)", opacity: 1 };

    return (
      <div style={style} className="bg-green-500 text-white">
        {v}
      </div>
    );
  }

  return (
    
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-8 text-white">
        <div className="max-w-7xl w-full">
            <h1 className="text-3xl font-extrabold mb-2 text-white ">Stack</h1>
            <h4 className="text-3xl font-extrabold mb-2 text-white ">A Last-In-First-Out (LIFO) data structure with push and pop operations.

</h4><br></br>

<div className="bg-[#111827] max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start 
                mt-10 px-8 py-6 rounded-xl">
        {/* STACK VISUAL */}
        <div className="col-span-2 flex flex-col items-center">
            
          <div
            className="relative w-80 min-h-[420px] flex flex-col items-start justify-start"
            aria-label="Stack container"
          >
            <div
              className="absolute inset-x-0 top-0 bottom-0 mx-auto"
              style={{ width: 300 }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 12,
                  width: 6,
                  borderLeft: "6px solid #cbd5e1",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 12,
                  width: 6,
                  borderRight: "6px solid #cbd5e1",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 20,
                  borderBottom: "6px solid #cbd5e1",
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 12,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 32,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  paddingTop: 12,
                  overflowY: "auto",
                }}
              >
                {nodes.length === 0 ? (
                  <div className="text-gray-400 mt-8">Empty. Push to add items.</div>
                ) : (
                  nodes.map((n) => <VisualNode key={n.id} node={n} />)
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold">Stack</h3>
          </div>
        </div>

        {/* CONTROL / INFO PANEL */}
        <div className="bg-[#0b1220] border border-gray-800 rounded-xl p-6 shadow-lg">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Top of the Stack:</span>
              <div className="bg-blue-600 px-3 py-1 rounded font-bold text-sm">
                {top ?? "—"}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-gray-300">Size of the Stack:</span>
              <div className="bg-blue-600 px-3 py-1 rounded font-bold text-sm">
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
              onClick={handlePush}
              disabled={isBusy}
              className="flex-1 bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded disabled:opacity-50"
            >
              Push
            </button>
            <button
              onClick={handlePop}
              disabled={isBusy}
              className="flex-1 bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded disabled:opacity-50"
            >
              Pop
            </button>
          </div>
          <div className="flex gap-3 mt-3">
            <button
              onClick={handlePeek}
              disabled={isBusy}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded disabled:opacity-50"
            >
              Peek
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
                    {h.type === "push" ? (
                      <ArrowDownCircle className="text-green-400 w-4 h-4" />
                    ) : (
                      <ArrowUpCircle className="text-red-400 w-4 h-4" />
                    )}
                    <span>
                      {h.type === "push" ? "Push" : "Pop"}: {h.val}
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

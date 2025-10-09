import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export default function StackVisualizer() {
  const capacity = 5; // fixed-size stack
  const [stack, setStack] = useState(Array(capacity).fill(null));
  const [top, setTop] = useState(-1);
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);

  // Code + explanation
  const [codeLines, setCodeLines] = useState([]);
  const [activeLine, setActiveLine] = useState(null);
  const [explanationText, setExplanationText] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);

  const stepDelay = 700;

  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  const addHistory = (type, val) => {
    setHistory((prev) => [{ type, val, id: Date.now() }, ...prev]);
  };

  // Actual code blocks
  const pushCode = [
    "def push(value):",
    "    global top, stack",
    "    if top == capacity - 1:",
    "        print('Overflow')",
    "        return",
    "    top += 1",
    "    stack[top] = value",
  ];

  const pushExplain = [
    "Start push operation.",
    "Use global top and stack.",
    "Check if stack is full.",
    "If full, overflow.",
    "Otherwise, continue.",
    "Increase top index.",
    "Insert value at new top.",
  ];

  const popCode = [
    "def pop():",
    "    global top, stack",
    "    if top == -1:",
    "        print('Underflow')",
    "        return",
    "    value = stack[top]",
    "    top -= 1",
    "    return value",
  ];

  const popExplain = [
    "Start pop operation.",
    "Use global top and stack.",
    "Check if stack is empty.",
    "If empty, underflow.",
    "Otherwise, continue.",
    "Take value at top.",
    "Decrease top index.",
    "Return popped value.",
  ];

  // Run explanation with visualization
  const runPush = async (val) => {
    if (isExplaining) return;
    setIsExplaining(true);
    setCodeLines(pushCode);

    for (let i = 0; i < pushCode.length; i++) {
      setActiveLine(i);
      setExplanationText(pushExplain[i]);
      await wait(stepDelay);

      if (i === 2 && top === capacity - 1) {
        setMessage("Stack Overflow!");
        break;
      }
      if (i === 5) setTop((prev) => prev + 1);
      if (i === 6) {
        setStack((prev) => {
          const newStack = [...prev];
          newStack[top + 1] = val;
          return newStack;
        });
        addHistory("push", val);
      }
    }

    setIsExplaining(false);
    setActiveLine(null);
    setExplanationText("");
    setValue("");
  };

  const runPop = async () => {
    if (isExplaining) return;
    setIsExplaining(true);
    setCodeLines(popCode);

    let poppedVal = null;
    for (let i = 0; i < popCode.length; i++) {
      setActiveLine(i);
      setExplanationText(popExplain[i]);
      await wait(stepDelay);

      if (i === 2 && top === -1) {
        setMessage("Stack Underflow!");
        break;
      }
      if (i === 5) poppedVal = stack[top];
      if (i === 6) setTop((prev) => prev - 1);
    }

    if (poppedVal !== null) addHistory("pop", poppedVal);

    setIsExplaining(false);
    setActiveLine(null);
    setExplanationText("");
  };

  const handlePeek = () => {
    if (top === -1) setMessage("Stack empty");
    else setMessage(`Top: ${stack[top]}`);
  };

  const handleReset = () => {
    setStack(Array(capacity).fill(null));
    setTop(-1);
    setHistory([]);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-[#0d1117] p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">Stack Visualizer (LIFO) </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Stack visualization */}
        <div className="flex flex-col items-center">
          <div className="relative w-40 min-h-[400px] border-4 border-gray-400 rounded-lg flex flex-col-reverse justify-start items-center">
            {stack.map((val, idx) => (
              <div
                key={idx}
                className={`w-24 h-12 m-1 flex items-center justify-center rounded ${
                  idx <= top ? "bg-blue-600" : "bg-gray-800"
                }`}
              >
                {idx <= top ? val : ""}
              </div>
            ))}
          </div>
          <div className="mt-2">Top = {top}</div>

          <div className="mt-4 w-64">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value"
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600"
              disabled={isExplaining}
            />
            <div className="flex gap-2 mt-3">
              <button onClick={() => runPush(value)} className="flex-1 bg-sky-500 rounded py-2">Push</button>
              <button onClick={runPop} className="flex-1 bg-sky-500 rounded py-2">Pop</button>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={handlePeek} className="flex-1 bg-indigo-600 rounded py-2">Peek</button>
              <button onClick={handleReset} className="flex-1 bg-red-600 rounded py-2">Reset</button>
            </div>
            {message && <div className="mt-2 text-yellow-400 text-sm">{message}</div>}
          </div>

          <div className="mt-4 bg-gray-900 p-3 rounded w-64">
            <h4 className="font-semibold mb-2">History</h4>
            {history.length === 0 ? (
              <p className="text-sm text-gray-500">No operations yet.</p>
            ) : (
              <ul className="text-sm space-y-1">
                {history.map((h) => (
                  <li key={h.id} className="flex items-center gap-2">
                    {h.type === "push" ? (
                      <ArrowDownCircle className="text-green-400 w-4 h-4" />
                    ) : (
                      <ArrowUpCircle className="text-red-400 w-4 h-4" />
                    )}
                    <span>
                      {h.type}: {h.val}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* RIGHT: Code + Explanation */}
        <div className="bg-[#111827] p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Stack Code</h2>
          <div className="bg-[#0b1220] p-3 rounded mb-3 overflow-y-auto h-64">
            <pre className="text-sm leading-6">
              {codeLines.length === 0 ? (
                <code className="text-green-400">Select Push/Pop to see code</code>
              ) : (
                codeLines.map((ln, idx) => (
                  <motion.div
                    key={idx}
                    animate={{
                      backgroundColor: idx === activeLine ? "#374151" : "transparent",
                      color: idx === activeLine ? "#facc15" : "#a7f3d0",
                    }}
                    transition={{ duration: 0.3 }}
                    className="px-2 rounded"
                  >
                    <code>{ln}</code>
                  </motion.div>
                ))
              )}
            </pre>
          </div>
          <div className="bg-[#0b1220] p-3 rounded">
            <h4 className="font-semibold mb-2">Line explanation</h4>
            <div className="min-h-[60px] text-sm">{explanationText || "Idle..."}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
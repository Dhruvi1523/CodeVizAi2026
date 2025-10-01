import React, { useState } from "react";
import { motion } from "framer-motion";

// --- Visual Node Sub-component (Theme Applied) ---
// The animation logic remains the same, only colors are updated.
const VisualNode = ({ node }) => {
  const { value, status } = node;
  const ANIM_MS = 300;
  
  const baseStyle = {
    transition: `all ${ANIM_MS}ms cubic-bezier(0.2, 0.9, 0.2, 1)`,
    minWidth: 70,
    padding: "12px 16px",
    margin: "0 6px",
    textAlign: "center",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "18px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.25)",
  };

  // Logic for enter/leave animation
  const style =
    status === "enter"
      ? { ...baseStyle, transform: "scale(0.8)", opacity: 0 }
      : status === "leave"
      ? { ...baseStyle, transform: "scale(0.8)", opacity: 0 }
      : { ...baseStyle, transform: "scale(1)", opacity: 1 };

  return (
    <div style={style} className="bg-[#6366f1] text-[#f1f5f9]">
      {value}
    </div>
  );
};


// --- Main Visualizer Component ---
export default function QueueVisualizer() {
  const [queue, setQueue] = useState([]);
  const [value, setValue] = useState("");
  const [front, setFront] = useState(0);
  const [rear, setRear] = useState(-1);
  const [history, setHistory] = useState([]);
  const [code, setCode] = useState("Select Enqueue/Dequeue to see code");
  const [explanation, setExplanation] = useState("Idle...");

  // ================= ENQUEUE =================
  const enqueue = () => {
    if (value === "") return;
    const newRear = rear + 1;
    setQueue([...queue, value]);
    setRear(newRear);
    setHistory([...history, `Enqueue ${value}`]);

    setCode(`def enqueue(x):\n    global rear\n    rear += 1\n    queue[rear] = x);
    setExplanation(Inserted ${value} at rear = ${newRear}`);
    setValue("");
  };

  // ================= DEQUEUE =================
  const dequeue = () => {
    if (front > rear) {
      setExplanation("Queue is empty, cannot dequeue");
      return;
    }
    const removed = queue[front];
    setFront(front + 1);
    setHistory([...history,` Dequeue ${removed}`]);

    setCode(`def dequeue():\n    global front\n    x = queue[front]\n    front += 1\n    return x);
    setExplanation(Removed ${removed}, now front = ${front + 1}`);
  };

  // ================= PEEK =================
  const peek = () => {
    if (front > rear) {
      setExplanation("Queue is empty, nothing to peek");
      return;
    }
    const peekVal = queue[front];
    setHistory([...history, `Peek ${peekVal}`]);

    setCode(`def peek():\n    return queue[front]`);
    setExplanation(`Peeked value = ${peekVal} at front = ${front}`);
  };

  // ================= RESET =================
  const reset = () => {
    setQueue([]);
    setValue("");
    setFront(0);
    setRear(-1);
    setHistory([]);
    setCode("Select Enqueue/Dequeue to see code");
    setExplanation("Idle...");
  };

  return (
    <div className="grid grid-cols-2 gap-6 p-6 text-white">
      {/* LEFT: Queue Visualization */}
      <div>
        <h2 className="text-xl font-bold mb-4">Queue Visualizer (with front & rear)</h2>

        {/* Queue Box */}
        <div className="flex border-2 border-gray-500 rounded-lg w-full h-40 items-end justify-center space-x-2 p-2">
          {queue.slice(front, rear + 1).map((item, i) => (
            <motion.div
              key={i}
              className="w-12 h-12 flex items-center justify-center border rounded-lg bg-blue-600 text-white"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              {item}
            </motion.div>
          ))}
        </div>

        {/* Front & Rear pointers */}
        <div className="flex justify-between px-4 mt-2">
          <p>Front = {front}</p>
          <p>Rear = {rear}</p>
        </div>

        {/* Input + Buttons */}
        <div className="mt-4">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter value"
            className="p-2 rounded text-black w-full"
          />
          <div className="flex space-x-2 mt-2">
            <button onClick={enqueue} className="flex-1 px-4 py-2 bg-blue-500 rounded">Enqueue</button>
            <button onClick={dequeue} className="flex-1 px-4 py-2 bg-green-500 rounded">Dequeue</button>
            <button onClick={peek} className="flex-1 px-4 py-2 bg-purple-500 rounded">Peek</button>
            <button onClick={reset} className="flex-1 px-4 py-2 bg-red-500 rounded">Reset</button>
          </div>
        </div>

        {/* History */}
        <div className="mt-4 bg-gray-800 p-2 rounded-lg">
          <h3 className="font-bold">History</h3>
          {history.length === 0 ? (
            <p>No operations yet.</p>
          ) : (
            <ul className="list-disc list-inside">
              {history.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* RIGHT: Python Code + Explanation */}
      <div className="bg-gray-900 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Queue Code</h3>
        <pre className="bg-black p-2 rounded text-green-400">{code}</pre>
        <h3 className="font-bold mt-4">Line explanation</h3>
        <p>{explanation}</p>
      </div>
    </div>
  );
}
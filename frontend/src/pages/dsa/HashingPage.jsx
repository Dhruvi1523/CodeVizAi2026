import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Trash2, Search } from "lucide-react";

/**
 * HashingVisualizer
 *
 * Features:
 * - Linear probing (user-controlled stepSize)
 * - Quadratic probing
 * - Double hashing
 * - Chaining
 * - Animated probing (cell highlights / pulses) synchronized with code lines & explanations
 * - History & calculation / message pane
 *
 * Notes:
 * - Keep TABLE_SIZE small for clear visualization (7 is default)
 * - Make sure tailwind + framer-motion + lucide-react are available
 */

export default function HashingVisualizer() {
  const TABLE_SIZE = 7;

  // Table: null | number | array (for chaining)
  const [table, setTable] = useState(Array(TABLE_SIZE).fill(null));

  // Per-cell status for animation: "idle" | "probing" | "collision" | "inserted" | "found"
  const [cellStatus, setCellStatus] = useState(Array(TABLE_SIZE).fill("idle"));

  const [key, setKey] = useState("");
  const [message, setMessage] = useState("");
  const [calculation, setCalculation] = useState("");
  const [history, setHistory] = useState([]);

  const [strategy, setStrategy] = useState("linear");
  const [stepSize, setStepSize] = useState(1); // only used in linear; but user sees & controls it
  const [animSpeed, setAnimSpeed] = useState(650); // ms, animation delay

  // Code & explanation handling
  const [codeLines, setCodeLines] = useState([]);
  const [explainLines, setExplainLines] = useState([]);
  const [activeLine, setActiveLine] = useState(null);
  const [explanationText, setExplanationText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  // helper: wait
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  const addHistory = (action, value, info = "") => {
    setHistory((prev) => [{ action, value, info, id: Date.now() }, ...prev]);
  };

  // --- Code & explanation templates ---
  const codeStrategies = {
    linear: [
      "def insert(key):",
      "    index = key % TABLE_SIZE",
      "    while table[index] is not None:",
      "        index = (index + step_size) % TABLE_SIZE",
      "    table[index] = key",
    ],
    quadratic: [
      "def insert(key):",
      "    index = key % TABLE_SIZE",
      "    probes = 1",
      "    while table[index] is not None:",
      "        index = (index + probes * probes) % TABLE_SIZE",
      "        probes += 1",
      "    table[index] = key",
    ],
    double: [
      "def insert(key):",
      "    index = key % TABLE_SIZE",
      "    step = 1 + (key % (TABLE_SIZE - 1))",
      "    while table[index] is not None:",
      "        index = (index + step) % TABLE_SIZE",
      "    table[index] = key",
    ],
    chaining: [
      "def insert(key):",
      "    index = key % TABLE_SIZE",
      "    table[index].append(key)  # each cell is a list",
    ],
  };

  const explainStrategies = {
    linear: [
      "Start insertion.",
      "Compute index = key % TABLE_SIZE.",
      "Check if position is empty.",
      "If occupied, move by step_size and check again until empty.",
      "Insert key at empty position.",
    ],
    quadratic: [
      "Start insertion.",
      "Compute index = key % TABLE_SIZE.",
      "Start probes counter.",
      "Check if position is empty.",
      "If occupied, move by probes^2 and check again. Increment probes.",
      "Repeat until empty then insert.",
      "Insert key at found position.",
    ],
    double: [
      "Start insertion.",
      "Compute index = key % TABLE_SIZE.",
      "Compute step = 1 + (key % (TABLE_SIZE-1)).",
      "Check if position is empty.",
      "If occupied, move by step and check again until empty.",
      "Insert key at found position.",
    ],
    chaining: [
      "Start insertion.",
      "Compute index = key % TABLE_SIZE.",
      "Append the key to the list at index (create list if empty).",
    ],
  };

  // Set code/explanations when strategy changes
  useEffect(() => {
    setCodeLines(codeStrategies[strategy]);
    setExplainLines(explainStrategies[strategy]);
    setActiveLine(null);
    setExplanationText("");
  }, [strategy]);

  // Utility: set cell status at index
  const setCellState = (idx, status) => {
    setCellStatus((prev) => {
      const copy = [...prev];
      copy[idx] = status;
      return copy;
    });
  };

  // Utility: update table cell safely (handles chaining)
  const updateTableCell = (idx, valueUpdater) => {
    setTable((prev) => {
      const copy = [...prev];
      copy[idx] = valueUpdater(copy[idx]);
      return copy;
    });
  };

  // Get next index depending on strategy
  const getNextIndex = (strategy, currentIndex, keyNum, probes) => {
    if (strategy === "linear") {
      return (currentIndex + stepSize) % TABLE_SIZE;
    }
    if (strategy === "quadratic") {
      return (currentIndex + probes * probes) % TABLE_SIZE;
    }
    if (strategy === "double") {
      const step = 1 + (keyNum % (TABLE_SIZE - 1));
      return (currentIndex + step) % TABLE_SIZE;
    }
    return currentIndex;
  };

  // --- Main insert animator ---
  const runInsert = async (k) => {
    if (isAnimating) return;
    if (!k.toString().trim()) {
      setMessage("Enter a numeric key to insert.");
      return;
    }
    const keyNum = parseInt(k, 10);
    if (Number.isNaN(keyNum)) {
      setMessage("Please enter a valid integer.");
      return;
    }

    setIsAnimating(true);
    setMessage("");
    setCalculation("");
    setCodeLines(codeStrategies[strategy]);
    setExplainLines(explainStrategies[strategy]);
    setActiveLine(0);

    // Special: chaining - just append to list at index
    let index = keyNum % TABLE_SIZE;

    if (strategy === "chaining") {
      // animate: highlight index, pulse, then insert
      setActiveLine(0);
      setExplanationText(explainLines[0] || "");
      await wait(animSpeed / 1.5);

      setActiveLine(1);
      setExplanationText(explainLines[1] || "");
      setCellState(index, "probing");
      setCalculation(`index = ${keyNum} % ${TABLE_SIZE} = ${index}`);
      await wait(animSpeed);

      // perform insertion
      setCellState(index, "inserted");
      updateTableCell(index, (cur) => {
        if (Array.isArray(cur)) return [...cur, keyNum];
        if (cur === null) return [keyNum];
        return [cur, keyNum];
      });
      addHistory("insert", keyNum, `Appended to chain at ${index}`);
      setMessage(`✅ Inserted ${keyNum} in chain at index ${index}`);
      await wait(animSpeed);
      setCellState(index, "idle");
      setIsAnimating(false);
      setActiveLine(null);
      setExplanationText("");
      setKey("");
      setCalculation("");
      return;
    }

    // For open-addressing strategies:
    // initialize
    index = keyNum % TABLE_SIZE;
    let probes = 1;
    let steps = 0;
    let inserted = false;

    // visualize computing index
    setActiveLine(1);
    setExplanationText(explainLines[1] || "");
    setCalculation(`Initial index = ${keyNum} % ${TABLE_SIZE} = ${index}`);
    setCellState(index, "probing");
    await wait(animSpeed);

    // If slot empty -> insert quickly
    if (table[index] === null) {
      setActiveLine(codeLines.length - 1); // final insert line
      setExplanationText(explainLines[explainLines.length - 1] || "Insert at position.");
      setCellState(index, "inserted");
      await wait(animSpeed);
      updateTableCell(index, () => keyNum);
      addHistory("insert", keyNum, `Inserted at index ${index} (no collision)`);
      setMessage(`✅ Inserted ${keyNum} at index ${index}`);
      setCalculation("");
      await wait(animSpeed);
      setCellState(index, "idle");
      inserted = true;
    } else {
      // collision occurs
      setActiveLine(2); // while check
      setExplanationText(explainLines[2] || "");
      await wait(animSpeed / 1.2);

      // show first collision mark
      setCellState(index, "collision");
      setMessage(`⚠️ Collision at index ${index}`);
      await wait(animSpeed);

      // probing loop — we will loop until we find empty or full cycle
      const seen = new Set();
      let attempts = 0;
      while (!inserted && attempts < TABLE_SIZE) {
        // compute next index based on strategy
        const oldIndex = index;
        if (strategy === "quadratic") {
          index = getNextIndex("quadratic", oldIndex, keyNum, probes);
          setCalculation(`Quadratic: (${oldIndex} + ${probes}^2) % ${TABLE_SIZE} = ${index}`);
          probes += 1;
        } else if (strategy === "double") {
          const step = 1 + (keyNum % (TABLE_SIZE - 1));
          index = getNextIndex("double", oldIndex, keyNum, probes);
          setCalculation(`Double: (${oldIndex} + ${step}) % ${TABLE_SIZE} = ${index}`);
        } else {
          // linear
          index = getNextIndex("linear", oldIndex, keyNum, probes);
          setCalculation(`Linear: (${oldIndex} + ${stepSize}) % ${TABLE_SIZE} = ${index}`);
        }

        // animate movement: clear previous probe highlighting & set new probing highlight
        setCellState(oldIndex, "collision"); // previous stays marked collision briefly
        setActiveLine(3); // probing step line
        setExplanationText(explainLines[3] || "Probing to next index...");
        await wait(animSpeed / 2);

        setCellState(oldIndex, "idle");
        setCellState(index, "probing");
        setMessage(`➡️ Probing index ${index}...`);
        await wait(animSpeed);

        // check slot
        if (table[index] === null) {
          // insert here
          setCellState(index, "inserted");
          setActiveLine(codeLines.length - 1);
          setExplanationText(explainLines[explainLines.length - 1] || "Insert at position.");
          await wait(animSpeed / 1.2);
          updateTableCell(index, () => keyNum);
          addHistory("insert", keyNum, `Inserted at index ${index} after ${attempts + 1} probe(s)`);
          setMessage(`✅ Inserted ${keyNum} at index ${index} after ${attempts + 1} probe(s)`);
          setCalculation("");
          await wait(animSpeed);
          setCellState(index, "idle");
          inserted = true;
          break;
        } else {
          // collision at this index, mark and continue
          setCellState(index, "collision");
          setMessage(`⚠️ Collision at index ${index}. Continuing probes...`);
          await wait(animSpeed);
          // increment attempts & probes (probes already incremented for quadratic earlier)
          attempts += 1;
          steps += 1;
          // safety: if we cycle, break
          if (seen.has(index)) {
            setMessage("Table seems full or cycle detected — cannot insert.");
            addHistory("insert-fail", keyNum, `Failed after ${attempts} attempts`);
            break;
          }
          seen.add(index);
          // clear collision marker for next iteration (visual)
          setCellState(index, "idle");
        }
      }
    }

    // final cleanup
    setIsAnimating(false);
    setActiveLine(null);
    setExplanationText("");
    setKey("");
  };

  // --- Search with animation (simple) ---
  const runSearch = async (k) => {
    if (isAnimating) return;
    if (!k.toString().trim()) {
      setMessage("Enter a key to search.");
      return;
    }
    const keyNum = parseInt(k, 10);
    if (Number.isNaN(keyNum)) {
      setMessage("Please enter a valid integer.");
      return;
    }

    setIsAnimating(true);
    setMessage("");
    setCalculation("");
    setCodeLines(["def search(key):", "    index = key % TABLE_SIZE", "    while table[index] is not None:", "        if table[index] == key: return True", "        index = next_probe(index)  # depends on strategy", "    return False"]);
    setActiveLine(0);
    await wait(animSpeed / 2);

    let index = keyNum % TABLE_SIZE;
    setActiveLine(1);
    setExplanationText("Compute initial index.");
    setCalculation(`index = ${keyNum} % ${TABLE_SIZE} = ${index}`);
    setCellState(index, "probing");
    await wait(animSpeed);

    // If chaining
    if (strategy === "chaining") {
      setActiveLine(2);
      setExplanationText("Look in chain (list) at that index.");
      if (Array.isArray(table[index])) {
        setCellState(index, "probing");
        await wait(animSpeed);
        const found = table[index].includes(keyNum);
        setCellState(index, found ? "found" : "idle");
        setMessage(found ? `🔎 Found ${keyNum} in chain at index ${index}` : `❌ ${keyNum} not found in chain at index ${index}`);
        if (found) addHistory("search", keyNum, `Found in chain at ${index}`);
      } else {
        setMessage(`❌ ${keyNum} not found (no chain at index).`);
      }
      setIsAnimating(false);
      setActiveLine(null);
      setExplanationText("");
      setCalculation("");
      return;
    }

    // open addressing search — probe until empty or found
    let probes = 1;
    let attempts = 0;
    const seen = new Set();
    while (attempts < TABLE_SIZE) {
      setCellState(index, "probing");
      setActiveLine(3);
      setExplanationText("Check this index for key.");
      await wait(animSpeed);

      if (table[index] === keyNum) {
        setCellState(index, "found");
        setMessage(`🔎 Found ${keyNum} at index ${index}`);
        addHistory("search", keyNum, `Found at ${index}`);
        break;
      }
      if (table[index] === null) {
        setMessage(`❌ ${keyNum} not found (empty slot at ${index}).`);
        break;
      }

      // not found at this index — compute next
      setCellState(index, "collision");
      if (strategy === "quadratic") {
        const next = (index + probes * probes) % TABLE_SIZE;
        setCalculation(`Quadratic next: (${index} + ${probes}^2) % ${TABLE_SIZE} = ${next}`);
        index = next;
        probes += 1;
      } else if (strategy === "double") {
        const step = 1 + (keyNum % (TABLE_SIZE - 1));
        const next = (index + step) % TABLE_SIZE;
        setCalculation(`Double next: (${index} + ${step}) % ${TABLE_SIZE} = ${next}`);
        index = next;
      } else {
        const next = (index + stepSize) % TABLE_SIZE;
        setCalculation(`Linear next: (${index} + ${stepSize}) % ${TABLE_SIZE} = ${next}`);
        index = next;
      }

      await wait(animSpeed);
      setCellState(index, "idle");
      attempts += 1;
      if (seen.has(index)) {
        setMessage("Search cycled — not found.");
        break;
      }
      seen.add(index);
    }

    setIsAnimating(false);
    setActiveLine(null);
    setExplanationText("");
    setCalculation("");
  };

  // --- Delete with animation (open addressing: simple remove, chaining: remove from list) ---
  const runDelete = async (k) => {
    if (isAnimating) return;
    if (!k.toString().trim()) {
      setMessage("Enter a key to delete.");
      return;
    }
    const keyNum = parseInt(k, 10);
    if (Number.isNaN(keyNum)) {
      setMessage("Please enter a valid integer.");
      return;
    }

    setIsAnimating(true);
    setMessage("");
    setCalculation("");
    setCodeLines(["def delete(key):", "    index = key % TABLE_SIZE", "    while table[index] is not None:", "        if table[index] == key: remove(); return", "        index = next_probe(index)"]);
    setActiveLine(0);

    let index = keyNum % TABLE_SIZE;
    setActiveLine(1);
    setCalculation(`index = ${keyNum} % ${TABLE_SIZE} = ${index}`);
    setCellState(index, "probing");
    await wait(animSpeed);

    if (strategy === "chaining") {
      setActiveLine(2);
      setExplanationText("Remove from chain (if exists).");
      if (Array.isArray(table[index])) {
        setCellState(index, "probing");
        await wait(animSpeed);
        if (table[index].includes(keyNum)) {
          updateTableCell(index, (cur) => cur.filter((x) => x !== keyNum));
          setMessage(`🗑️ Deleted ${keyNum} from chain at ${index}`);
          addHistory("delete", keyNum, `Deleted from chain at ${index}`);
        } else {
          setMessage(`❌ ${keyNum} not found in chain at ${index}`);
        }
      } else {
        setMessage(`❌ No chain at index ${index}`);
      }
      setCellState(index, "idle");
      setIsAnimating(false);
      setActiveLine(null);
      setExplanationText("");
      return;
    }

    // open addressing delete: find then remove by setting to null (not rehashing tombstones for simplicity)
    let probes = 1;
    let attempts = 0;
    const seen = new Set();
    while (attempts < TABLE_SIZE) {
      setCellState(index, "probing");
      setActiveLine(2);
      setExplanationText("Check for key at this index.");
      await wait(animSpeed);

      if (table[index] === keyNum) {
        // remove
        updateTableCell(index, () => null);
        setCellState(index, "idle");
        setMessage(`🗑️ Deleted ${keyNum} from index ${index}`);
        addHistory("delete", keyNum, `Deleted from ${index}`);
        break;
      }
      if (table[index] === null) {
        setMessage(`❌ ${keyNum} not found (empty slot at ${index}).`);
        break;
      }
      // continue probing
      setCellState(index, "collision");
      if (strategy === "quadratic") {
        index = (index + probes * probes) % TABLE_SIZE;
        setCalculation(`Quadratic next: (${index} + ${probes}^2) % ${TABLE_SIZE} = ${index}`);
        probes += 1;
      } else if (strategy === "double") {
        const step = 1 + (keyNum % (TABLE_SIZE - 1));
        index = (index + step) % TABLE_SIZE;
        setCalculation(`Double next: (${index} + ${step}) % ${TABLE_SIZE} = ${index}`);
      } else {
        index = (index + stepSize) % TABLE_SIZE;
        setCalculation(`Linear next: (${index} + ${stepSize}) % ${TABLE_SIZE} = ${index}`);
      }
      await wait(animSpeed);
      attempts += 1;
      if (seen.has(index)) {
        setMessage("Delete cycled — not found.");
        break;
      }
      seen.add(index);
    }

    setIsAnimating(false);
    setActiveLine(null);
    setExplanationText("");
    setCalculation("");
  };

  const handleReset = () => {
    if (isAnimating) return;
    setTable(Array(TABLE_SIZE).fill(null));
    setCellStatus(Array(TABLE_SIZE).fill("idle"));
    setHistory([]);
    setMessage("");
    setCalculation("");
    setKey("");
  };

  // UI rendering helpers
  const cellBgByStatus = (status, value) => {
    // return background color classes or hex
    if (Array.isArray(value)) return "bg-emerald-600";
    if (status === "probing") return "bg-yellow-500/80";
    if (status === "collision") return "bg-red-600/80";
    if (status === "inserted") return "bg-green-600";
    if (status === "found") return "bg-indigo-500";
    return value !== null ? "bg-sky-600" : "bg-[#1e293b]";
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">🧮 Hashing Visualizer</h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-center mb-4">
        <select
          className="px-3 py-2 rounded-md bg-[#1e293b] border border-blue-800 text-white"
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
          disabled={isAnimating}
        >
          <option value="linear">Linear Probing</option>
          <option value="quadratic">Quadratic Probing</option>
          <option value="double">Double Hashing</option>
          <option value="chaining">Chaining</option>
        </select>

        {strategy === "linear" && (
          <div className="flex gap-2 items-center">
            <label className="text-white">Step Size</label>
            <input
              type="number"
              min={1}
              max={TABLE_SIZE - 1}
              value={stepSize}
              onChange={(e) => {
                const v = Math.max(1, Math.min(TABLE_SIZE - 1, Number(e.target.value)));
                setStepSize(v);
              }}
              className="w-20 px-2 py-1 rounded-md bg-[#1e293b] border border-blue-800 text-white"
              disabled={isAnimating}
            />
          </div>
        )}

        <div className="flex gap-2 items-center">
          <label className="text-white">Animation speed (ms)</label>
          <input
            type="range"
            min="150"
            max="1200"
            value={animSpeed}
            onChange={(e) => setAnimSpeed(Number(e.target.value))}
            disabled={isAnimating}
          />
          <span className="w-14 text-right text-sm text-gray-300">{animSpeed}ms</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Table + Controls */}
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-1 gap-3">
            {table.map((val, idx) => {
              const status = cellStatus[idx] || "idle";
              const bg = cellBgByStatus(status, val);
              return (
                <motion.div
                  key={idx}
                  layout
                  initial={{ scale: 1 }}
                  animate={{
                    scale: status === "probing" ? 1.03 : status === "inserted" ? 1.05 : 1,
                    boxShadow:
                      status === "probing"
                        ? "0 8px 20px rgba(250,204,21,0.08)"
                        : status === "collision"
                        ? "0 8px 30px rgba(239,68,68,0.08)"
                        : "0 6px 18px rgba(2,6,23,0.6)",
                  }}
                  transition={{ duration: 0.25 }}
                  className={`w-64 h-12 flex items-center justify-between px-4 rounded-lg font-semibold border border-blue-700/40 ${bg}`}
                >
                  <span className="text-gray-200">[{idx}]</span>
                  <span className="text-white">
                    {Array.isArray(val) ? `[${val.join(", ")}]` : val !== null ? val : "—"}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-5 w-80">
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter key (integer)"
              className="w-full px-3 py-2 rounded-md bg-[#1e293b] border border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              disabled={isAnimating}
            />

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => runInsert(key)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg py-2 transition flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={isAnimating}
              >
                <PlusCircle size={18} /> Insert
              </button>

              <button
                onClick={() => runSearch(key)}
                className="flex-1 bg-amber-600 hover:bg-amber-700 rounded-lg py-2 transition flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={isAnimating}
              >
                <Search size={16} /> Search
              </button>

              <button
                onClick={() => runDelete(key)}
                className="flex-1 bg-red-600 hover:bg-red-700 rounded-lg py-2 transition flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={isAnimating}
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-700 hover:bg-gray-800 rounded-lg py-2 transition disabled:opacity-50"
                disabled={isAnimating}
              >
                Reset
              </button>
            </div>

            {calculation && (
              <div className="mt-3 text-yellow-300 text-center text-sm font-mono">
                🧮 {calculation}
              </div>
            )}

            {message && (
              <div className="mt-2 text-yellow-400 text-center text-sm">{message}</div>
            )}
          </div>

          {/* History */}
          <div className="mt-5 bg-[#101b33] p-3 rounded-lg w-80 border border-blue-900/40 shadow-inner">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold mb-2 text-blue-300">History</h4>
              <button
                onClick={() => setHistory([])}
                className="text-sm text-gray-400 hover:text-white"
                disabled={isAnimating}
              >
                Clear
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-sm text-gray-500">No operations yet.</p>
            ) : (
              <ul className="text-sm space-y-1 max-h-44 overflow-auto">
                {history.map((h) => (
                  <li key={h.id} className="text-gray-200">
                    ➤ <span className="font-medium">{h.action}</span>: {h.value}{" "}
                    {h.info && <span className="text-gray-400">({h.info})</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* RIGHT: Code + Explanation */}
        <div className="bg-[#0d162a] p-5 rounded-2xl border border-blue-800/40 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-300">Hashing Code & Explanation</h2>

          <div className="bg-[#0b1220] p-3 rounded-md mb-4 overflow-y-auto h-64 border border-blue-900/40">
            <pre className="text-sm leading-6 font-mono">
              {codeLines.length === 0 ? (
                <code className="text-gray-400">Select a strategy to view code & explanation</code>
              ) : (
                codeLines.map((ln, idx) => {
                  const isActive = idx === activeLine;
                  return (
                    <motion.div
                      key={idx}
                      animate={{
                        backgroundColor: isActive ? "#122244" : "transparent",
                        color: isActive ? "#facc15" : "#93c5fd",
                      }}
                      transition={{ duration: 0.25 }}
                      className="px-2 rounded"
                    >
                      <code>{ln}</code>
                    </motion.div>
                  );
                })
              )}
            </pre>
          </div>

          <div className="bg-[#0b1220] p-3 rounded-md border border-blue-900/40">
            <h4 className="font-semibold mb-2 text-blue-300">Line Explanation</h4>
            <div className="min-h-[80px] text-sm text-gray-300">
              <AnimatePresence mode="wait">
                <motion.div
                  key={explanationText || "idle"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  {explainLines.length > 0 && activeLine !== null
                    ? explainLines[activeLine] || "..."
                    : explanationText || "Idle..."}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

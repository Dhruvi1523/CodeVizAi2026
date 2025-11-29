// src/pages/dsa/RedBlackTree.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Tree from "react-d3-tree";

let NEXT_ID = 1;

const createNode = (value) => ({
  id: NEXT_ID++,
  value,
  left: null,
  right: null,
  color: "RED",
});

const cloneTree = (node) => {
  if (!node) return null;
  return {
    id: node.id,
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
    color: node.color,
  };
};

const isRed = (node) => node && node.color === "RED";
const isBlack = (node) => !node || node.color === "BLACK";

const rotateLeft = (h, frames) => {
  const x = h.right;
  h.right = x.left;
  x.left = h;
  x.color = h.color;
  h.color = "RED";

  frames.push({
    tree: cloneTree(x),
    msg: `LEFT ROTATION: ${h.value} → ${x.value} becomes parent`,
    highlight: x.id,
    type: "rotation",
  });
  return x;
};

const rotateRight = (h, frames) => {
  const x = h.left;
  h.left = x.right;
  x.right = h;
  x.color = h.color;
  h.color = "RED";

  frames.push({
    tree: cloneTree(x),
    msg: `RIGHT ROTATION: ${h.value} → ${x.value} becomes parent`,
    highlight: x.id,
    type: "rotation",
  });
  return x;
};

const flipColors = (h, frames) => {
  const old = `${h.color} → ${h.left?.color}/${h.right?.color}`;
  h.color = "RED";
  if (h.left) h.left.color = "BLACK";
  if (h.right) h.right.color = "BLACK";

  frames.push({
    tree: cloneTree(h),
    msg: `COLOR FLIP: Parent ${old} → RED, Children → BLACK`,
    highlight: h.id,
    type: "flip",
  });
};

// --- INSERT (unchanged from previous) ---
const insert = (root, value, frames = []) => {
  const insertRec = (node) => {
    if (!node) {
      const n = createNode(value);
      frames.push({ tree: cloneTree(n), msg: `New RED node ${value}`, highlight: n.id });
      return n;
    }

    const c = { ...node, left: node.left, right: node.right };
    frames.push({ tree: cloneTree(c), msg: `Visit ${c.value} (${c.color})`, highlight: c.id });

    if (value < node.value) c.left = insertRec(node.left);
    else if (value > node.value) c.right = insertRec(node.right);
    else {
      frames.push({ tree: cloneTree(c), msg: `Duplicate ${value} ignored` });
      return c;
    }

    if (isRed(c.right) && isBlack(c.left)) return rotateLeft(c, frames);
    if (isRed(c.left) && isRed(c.left.left)) return rotateRight(c, frames);
    if (isRed(c.left) && isRed(c.right)) flipColors(c, frames);

    return c;
  };

  const newRoot = insertRec(root);
  newRoot.color = "BLACK";
  frames.push({ tree: cloneTree(newRoot), msg: "Root fixed to BLACK", highlight: newRoot.id });
  return { newRoot, frames };
};

// --- FULL DELETE WITH REBALANCING ---
const deleteRB = (root, value, frames = []) => {
  const moveRedLeft = (h) => {
    flipColors(h, frames);
    if (isRed(h.right.left)) {
      h.right = rotateRight(h.right, frames);
      h = rotateLeft(h, frames);
      flipColors(h, frames);
    }
    return h;
  };

  const moveRedRight = (h) => {
    flipColors(h, frames);
    if (isRed(h.left.left)) {
      h = rotateRight(h, frames);
      flipColors(h, frames);
    }
    return h;
  };

  const fixDoubleBlack = (h) => {
    if (!h) return h;

    const c = { ...h, left: h.left, right: h.right };
    frames.push({ tree: cloneTree(c), msg: `Fixing double black at ${c.value}`, highlight: c.id, type: "fix" });

    if (isRed(c)) {
      c.color = "BLACK";
      return c;
    }

    if (c.left && isRed(c.left)) {
      c.left.color = "BLACK";
      c = rotateRight(c, frames);
      return c;
    }

    if (c.right && isRed(c.right)) {
      const siblingColor = c.right.color;
      c.right.color = c.color;
      c.color = "BLACK";
      c = rotateLeft(c, frames);
      c.right.color = siblingColor;
      return c;
    }

    if (c.right && (isRed(c.right.left) || isRed(c.right.right))) {
      if (isRed(c.right.left)) {
        c.right = rotateRight(c.right, frames);
      }
      c.right.color = c.color;
      c.color = "BLACK";
      c = rotateLeft(c, frames);
      c.right.right.color = "BLACK";
      return c;
    }

    if (c.right) c.right.color = "RED";
    return c;
  };

  const deleteRec = (node) => {
    if (!node) {
      frames.push({ tree: cloneTree(root), msg: `${value} not found` });
      return null;
    }

    const c = { ...node, left: node.left, right: node.right };
    frames.push({ tree: cloneTree(c), msg: `Search ${value} at ${c.value}`, highlight: c.id });

    if (value < node.value) {
      if (isBlack(c.left) && isBlack(c.left?.left)) c.left = moveRedLeft(c.left);
      c.left = deleteRec(c.left);
    } else {
      if (isRed(c)) c = rotateRight(c, frames);

      if (value === c.value && !c.right) {
        frames.push({ tree: null, msg: `Deleted leaf ${value}`, type: "delete" });
        return null;
      }

      if (isBlack(c.right) && isBlack(c.right?.left)) c.right = moveRedRight(c.right);

      if (value === c.value) {
        const min = c.right;
        let curr = min;
        while (curr.left) curr = curr.left;
        c.value = curr.value;
        frames.push({ tree: cloneTree(c), msg: `Replace ${value} with successor ${curr.value}` });
        c.right = deleteMin(c.right);
      } else {
        c.right = deleteRec(c.right);
      }
    }

    return fixDoubleBlack(c);
  };

  const deleteMin = (node) => {
    if (!node.left) return null;
    if (isBlack(node.left) && isBlack(node.left.left)) node = moveRedLeft(node);
    node.left = deleteMin(node.left);
    return fixDoubleBlack(node);
  };

  let newRoot = deleteRec(root);
  if (newRoot) newRoot.color = "BLACK";
  frames.push({ tree: cloneTree(newRoot), msg: "Deletion complete — tree rebalanced!" });
  return { newRoot, frames };
};

const toD3 = (node, highlightId = null, effectId = null, effectType = "") => {
  if (!node) return null;
  const children = [];
  if (node.left) children.push(toD3(node.left, highlightId, effectId, effectType));
  if (node.right) children.push(toD3(node.right, highlightId, effectType));

  return {
    name: String(node.value),
    attributes: {
      id: node.id,
      color: node.color,
      isHighlighted: node.id === highlightId,
      hasEffect: node.id === effectId,
      effectType,
    },
    children: children.length ? children : undefined,
  };
};

export default function RedBlackTree() {
  const [root, setRoot] = useState(null);
  const [d3Data, setD3Data] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [animationSpeed, setAnimationSpeed] = useState(1300);
  const [isAnimating, setIsAnimating] = useState(false);
  const [algorithmSteps, setAlgorithmSteps] = useState([]);
  const [currentHighlight, setCurrentHighlight] = useState(null);
  const [effectNode, setEffectNode] = useState(null);
  const [effectType, setEffectType] = useState("");
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setD3Data(root ? toD3(root, currentHighlight, effectNode, effectType) : null);
  }, [root, currentHighlight, effectNode, effectType]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const playAnimation = async (frames) => {
    setIsAnimating(true);
    setAlgorithmSteps([]);
    for (const frame of frames) {
      setD3Data(frame.tree ? toD3(frame.tree, frame.highlight || null, frame.highlight, frame.type || "") : null);
      setCurrentHighlight(frame.highlight || null);
      setEffectNode(frame.type ? frame.highlight : null);
      setEffectType(frame.type || "");

      setAlgorithmSteps(prev => [...prev.slice(-40), frame.msg]);

      const delay = frame.type === "rotation" ? animationSpeed * 1.8 :
                    frame.type === "flip" || frame.type === "fix" ? animationSpeed * 1.5 :
                    animationSpeed;
      await new Promise(r => setTimeout(r, delay));
    }
    setCurrentHighlight(null);
    setEffectNode(null);
    setEffectType("");
    setIsAnimating(false);
  };

  const handleInsert = async () => {
    if (isAnimating || !inputValue) return;
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) return;

    const { newRoot, frames } = insert(root, val);
    setRoot(newRoot);
    await playAnimation(frames);
    setInputValue("");
  };

  const handleDelete = async () => {
    if (isAnimating || !inputValue || !root) return;
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) return;

    const { newRoot, frames } = deleteRB(root, val);
    setRoot(newRoot);
    await playAnimation(frames);
    setInputValue("");
  };

  const handleClear = () => {
    NEXT_ID = 1;
    setRoot(null);
    setAlgorithmSteps([]);
    setInputValue("");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-2 sm:p-4">
      <header className="bg-gray-800 p-3 sm:p-4 shadow-md mb-3 sm:mb-4 rounded-lg sm:rounded-xl flex items-center justify-center relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-2 sm:left-4 flex items-center gap-2 px-2 sm:px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg border border-gray-600 transition text-xs sm:text-sm"
        >
          <span>←</span>
          <span>Back</span>
        </button>

        <div className="text-center">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-100">Red-Black Tree</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Self-balancing with rotations & rebalancing</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 auto-rows-max lg:auto-rows-auto">
        {/* Left Panel */}
        <div className="bg-gray-800 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg lg:row-span-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value"
            className="p-2 sm:p-3 rounded-lg border border-gray-700 bg-gray-900 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-green-400 outline-none w-full mb-2 sm:mb-3 text-sm sm:text-base"
            disabled={isAnimating}
          />

          <div className="flex flex-col sm:flex-row gap-2 mb-2 sm:mb-3">
            <button onClick={handleInsert} disabled={isAnimating || !inputValue}
              className="flex-1 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-500 disabled:opacity-60 transition text-sm sm:text-base">
              Insert
            </button>
            <button onClick={handleDelete} disabled={isAnimating || !inputValue}
              className="flex-1 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-500 disabled:opacity-60 transition text-sm sm:text-base">
              Delete
            </button>
            <button onClick={handleClear}
              className="flex-1 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-500 transition text-sm sm:text-base">
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3 sm:mb-6">
            <label className="text-xs sm:text-sm text-gray-300">Speed:</label>
            <input
              type="range"
              min="600"
              max="2500"
              step="100"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(+e.target.value)}
              className="flex-1 accent-green-500"
            />
            <span className="text-xs sm:text-sm text-gray-300 w-12 sm:w-14 text-right">{animationSpeed}</span>
          </div>

          <div className="bg-gray-900 p-3 sm:p-4 rounded-lg max-h-48 sm:max-h-64 overflow-y-auto border border-gray-700">
            <h2 className="text-sm sm:text-lg font-semibold mb-2 text-green-400">Steps</h2>
            {algorithmSteps.length > 0 ? (
              <ul className="list-disc pl-4 text-xs sm:text-sm text-gray-200 space-y-1">
                {algorithmSteps.map((s, i) => (
                  <li key={i} className={
                    s.includes("ROTATION") ? "text-yellow-400 font-bold" :
                    s.includes("FLIP") || s.includes("Fixing") ? "text-purple-400 font-bold" :
                    s.includes("Deleted") ? "text-red-400" : ""
                  }>
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-xs">Perform operations to see steps</p>
            )}
          </div>

          <div className="mt-4 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-600 rounded-lg p-3 sm:p-4">
            <h3 className="text-sm sm:text-lg font-bold text-purple-300 mb-2">Red-Black Rules</h3>
            <ul className="text-xs space-y-1 text-gray-300">
              <li><span className="text-red-400">Red</span> New nodes are RED</li>
              <li><span className="bg-black text-white px-1 rounded text-xs">Black</span> Root & leaves are BLACK</li>
              <li>No two RED nodes in a row</li>
              <li>Equal BLACK height on all paths</li>
            </ul>
          </div>
        </div>

        {/* Tree */}
        <div className="bg-gray-800 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg overflow-hidden lg:col-span-2 min-h-96 sm:min-h-[60vh] border border-gray-700">
          {d3Data ? (
            <Tree
              data={d3Data}
              orientation="vertical"
              translate={{ x: window.innerWidth / 2 / 2, y: 60 }}
              zoomable
              collapsible={false}
              separation={{ siblings: isMobile ? 1.5 : 1.8, nonSiblings: isMobile ? 1.8 : 2.3 }}
              pathFunc="diagonal"
              renderCustomNodeElement={({ nodeDatum }) => {
                const a = nodeDatum.attributes;
                const nodeRadius = isMobile ? 32 : 42;

                return (
                  <g>
                    {a?.hasEffect && a.effectType === "rotation" && (
                      <circle r={nodeRadius + 15} fill="none" stroke="#fbbf24" strokeWidth={6} opacity={0.7}>
                        <animate attributeName="r" values={`${nodeRadius + 15};${nodeRadius + 25};${nodeRadius + 15}`} dur="2s" repeatCount="1" />
                      </circle>
                    )}

                    <circle
                      r={nodeRadius}
                      fill={a?.color === "RED" ? "#ef4444" : "#0f172a"}
                      stroke={a?.isHighlighted ? "#10b981" : (a?.color === "RED" ? "#fca5a5" : "#1e293b")}
                      strokeWidth={a?.isHighlighted ? 6 : 3}
                      className="drop-shadow-2xl"
                    />
                    <text
                      textAnchor="middle"
                      dy=".3em"
                      fontSize={isMobile ? "18" : "22"}
                      fontWeight="bold"
                      fill={a?.color === "RED" ? "white" : "#10b981"}
                    >
                      {nodeDatum.name}
                    </text>
                  </g>
                );
              }}
              styles={{ links: { stroke: "#10b981", strokeWidth: isMobile ? 2.5 : 3.5 } }}
            />
          ) : (
            <p className="text-gray-500 h-full grid place-items-center text-center text-sm sm:text-base px-4">
              Insert values to visualize the Red-Black Tree!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
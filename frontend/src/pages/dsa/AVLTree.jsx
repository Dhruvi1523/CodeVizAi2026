// src/pages/dsa/AVLTree.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Tree from "react-d3-tree";

let NEXT_ID = 1;

const createNode = (value) => ({
  id: NEXT_ID++,
  value,
  left: null,
  right: null,
  height: 1,
});

const cloneTree = (node) => {
  if (!node) return null;
  return {
    id: node.id,
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
    height: node.height,
  };
};

const getHeight = (node) => (node ? node.height : 0);
const updateHeight = (node) => {
  if (!node) return;
  node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
};
const getBalance = (node) => getHeight(node?.left) - getHeight(node?.right);

const rotateRight = (y, frames) => {
  const x = y.left;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  updateHeight(y);
  updateHeight(x);
  return x;
};

const rotateLeft = (x, frames) => {
  const y = x.right;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  updateHeight(x);
  updateHeight(y);
  return y;
};

const insert = (root, value, frames = []) => {
  const insertRec = (node) => {
    if (!node) {
      const newNode = createNode(value);
      frames.push({ tree: cloneTree(newNode), msg: `Inserted ${value}`, highlight: newNode.id });
      return newNode;
    }

    const cloned = { ...node, left: node.left, right: node.right };

    frames.push({
      tree: cloneTree(cloned),
      msg: `${value} ${value < node.value ? "<" : ">"} ${node.value} → go ${value < node.value ? "left" : "right"}`,
      highlight: node.id,
    });

    if (value < node.value) cloned.left = insertRec(node.left);
    else if (value > node.value) cloned.right = insertRec(node.right);
    else {
      frames.push({ tree: cloneTree(cloned), msg: `Duplicate ${value} ignored`, highlight: node.id });
      return cloned;
    }

    updateHeight(cloned);
    const balance = getBalance(cloned);

    if (balance > 1) {
      if (value < cloned.left.value) {
        frames.push({ tree: cloneTree(cloned), msg: `Left-Left → Right Rotation on ${cloned.value}`, highlight: cloned.id });
        return rotateRight(cloned, frames);
      } else {
        frames.push({ tree: cloneTree(cloned), msg: `Left-Right → Double rotation`, highlight: cloned.id });
        cloned.left = rotateLeft(cloned.left, frames);
        return rotateRight(cloned, frames);
      }
    }
    if (balance < -1) {
      if (value > cloned.right.value) {
        frames.push({ tree: cloneTree(cloned), msg: `Right-Right → Left Rotation on ${cloned.value}`, highlight: cloned.id });
        return rotateLeft(cloned, frames);
      } else {
        frames.push({ tree: cloneTree(cloned), msg: `Right-Left → Double rotation`, highlight: cloned.id });
        cloned.right = rotateRight(cloned.right, frames);
        return rotateLeft(cloned, frames);
      }
    }

    return cloned;
  };

  const newRoot = insertRec(root);
  frames.push({ tree: cloneTree(newRoot), msg: "Insertion complete — tree balanced" });
  return { newRoot, frames };
};

const deleteNode = (root, value, frames = []) => {
  const deleteRec = (node) => {
    if (!node) {
      frames.push({ tree: cloneTree(root), msg: `${value} not found` });
      return null;
    }

    const cloned = { ...node, left: node.left, right: node.right };

    if (value < node.value) {
      frames.push({ tree: cloneTree(cloned), msg: `Searching left for ${value}`, highlight: node.id });
      cloned.left = deleteRec(node.left);
    } else if (value > node.value) {
      frames.push({ tree: cloneTree(cloned), msg: `Searching right for ${value}`, highlight: node.id });
      cloned.right = deleteRec(node.right);
    } else {
      frames.push({ tree: cloneTree(cloned), msg: `Found ${value} — deleting...`, highlight: node.id });

      if (!cloned.left || !cloned.right) {
        const temp = cloned.left || cloned.right;
        frames.push({ tree: cloneTree(temp || null), msg: `Removed leaf/node with one child` });
        return temp;
      }

      // Two children - get inorder successor
      let succParent = cloned;
      let succ = cloned.right;
      while (succ.left) {
        succParent = succ;
        succ = succ.left;
      }

      cloned.value = succ.value;
      frames.push({ tree: cloneTree(cloned), msg: `Replaced with successor ${succ.value}` });

      if (succParent !== cloned) {
        succParent.left = deleteRec(succ.right);
      } else {
        cloned.right = deleteRec(succ.right);
      }
    }

    if (!cloned) return cloned;

    updateHeight(cloned);
    const balance = getBalance(cloned);

    // Rebalance after deletion
    if (balance > 1) {
      if (getBalance(cloned.left) >= 0) {
        frames.push({ tree: cloneTree(cloned), msg: `Left heavy → Right Rotation`, highlight: cloned.id });
        return rotateRight(cloned, frames);
      } else {
        cloned.left = rotateLeft(cloned.left, frames);
        frames.push({ tree: cloneTree(cloned), msg: `Left-Right case → Double rotation`, highlight: cloned.id });
        return rotateRight(cloned, frames);
      }
    }
    if (balance < -1) {
      if (getBalance(cloned.right) <= 0) {
        frames.push({ tree: cloneTree(cloned), msg: `Right heavy → Left Rotation`, highlight: cloned.id });
        return rotateLeft(cloned, frames);
      } else {
        cloned.right = rotateRight(cloned.right, frames);
        frames.push({ tree: cloneTree(cloned), msg: `Right-Left case → Double rotation`, highlight: cloned.id });
        return rotateLeft(cloned, frames);
      }
    }

    return cloned;
  };

  const newRoot = deleteRec(root);
  frames.push({ tree: cloneTree(newRoot), msg: "Deletion complete — tree balanced" });
  return { newRoot, frames };
};

const toD3 = (node, highlightId = null) => {
  if (!node) return null;
  const children = [];
  if (node.left) children.push(toD3(node.left, highlightId));
  if (node.right) children.push(toD3(node.right, highlightId));

  const balance = getBalance(node);

  return {
    name: String(node.value),
    attributes: {
      id: node.id,
      height: node.height,
      balance,
      isHighlighted: node.id === highlightId,
    },
    children: children.length ? children : undefined,
  };
};

export default function AVLTree() {
  const [root, setRoot] = useState(null);
  const [d3Data, setD3Data] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [isAnimating, setIsAnimating] = useState(false);
  const [algorithmSteps, setAlgorithmSteps] = useState([]);
  const [currentHighlight, setCurrentHighlight] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef(null);
  const stepsRef = useRef(null);
  const navigate = useNavigate();

  // Responsive detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setD3Data(root ? toD3(root, currentHighlight) : null);
  }, [root, currentHighlight]);

  useEffect(() => {
    if (stepsRef.current) {
      stepsRef.current.scrollTop = stepsRef.current.scrollHeight;
    }
  }, [algorithmSteps]);

  const getTranslate = () => {
    if (!containerRef.current) return { x: 240, y: 60 };
    const { width, height } = containerRef.current.getBoundingClientRect();
    return { x: width / 2, y: Math.max(60, height * 0.1) };
  };

  const playAnimation = async (frames) => {
    setIsAnimating(true);
    setAlgorithmSteps([]);
    for (const frame of frames) {
      setD3Data(frame.tree ? toD3(frame.tree, frame.highlight || null) : null);
      setCurrentHighlight(frame.highlight || null);
      setAlgorithmSteps(prev => [...prev.slice(-50), frame.msg]);
      await new Promise(r => setTimeout(r, animationSpeed));
    }
    setCurrentHighlight(null);
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
    if (isAnimating || !root || !inputValue) return;
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) return;

    const { newRoot, frames } = deleteNode(root, val);
    setRoot(newRoot);
    await playAnimation(frames);
    setInputValue("");
  };

  const clearTree = () => {
    NEXT_ID = 1;
    setRoot(null);
    setAlgorithmSteps([]);
    setInputValue("");
  };

  const CustomNode = ({ nodeDatum }) => {
    const a = nodeDatum.attributes || {};
    const balance = a?.balance || 0;
    const isSmall = isMobile;
    const nodeRadius = isSmall ? 24 : 40;
    const textSize = isSmall ? 14 : 22;
    const infoSize = isSmall ? 10 : 14;

    return (
      <g>
        <circle
          r={nodeRadius}
          fill="#ffffff"
          stroke="#10b981"
          strokeWidth={a?.isHighlighted ? 5 : 3}
          className="drop-shadow-lg"
        />
        <text textAnchor="middle" dy={isSmall ? "-6" : "-12"} fontSize={textSize} fontWeight="bold" fill="#000000">
          {nodeDatum.name}
        </text>
        <text textAnchor="middle" dy={isSmall ? "4" : "10"} fontSize={infoSize} fill="#333333">
          h={a?.height || 1}
        </text>
        <text textAnchor="middle" dy={isSmall ? "14" : "26"} fontSize={infoSize} fill="#ef4444" fontWeight="bold">
          b={balance > 0 ? "+" : ""}{balance}
        </text>
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-2 sm:p-4">
      {/* Header with Back Button on Left and Title Centered */}
      <header className="bg-gray-800 p-3 sm:p-4 shadow-md mb-3 sm:mb-4 rounded-lg sm:rounded-xl flex items-center justify-center relative">
        {/* Back Button - Left Side */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-3 sm:left-4 flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg border border-gray-600 transition text-sm sm:text-base"
        >
          <span>←</span>
          <span>Back</span>
        </button>

        {/* Centered Title */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-100">AVL Tree Visualizer</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Self-balancing BST • Insert & Delete with rotations</p>
        </div>
      </header>

      {/* Rest of component */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 auto-rows-max lg:auto-rows-auto">
        {/* Left Panel */}
        <div className="bg-gray-800 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg lg:row-span-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.shiftKey ? handleDelete() : handleInsert())}
            placeholder="Enter value"
            className="p-2 rounded-lg border border-gray-700 bg-gray-900 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-green-400 outline-none w-full mb-2 sm:mb-3 text-sm sm:text-base"
            disabled={isAnimating}
          />

          <div className="flex flex-col sm:flex-row gap-2 mb-2 sm:mb-3">
            <button
              onClick={handleInsert}
              disabled={isAnimating || !inputValue}
              className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-500 disabled:opacity-60 transition text-sm sm:text-base flex-1"
            >
              Insert
            </button>
            <button
              onClick={handleDelete}
              disabled={isAnimating || !inputValue || !root}
              className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-500 disabled:opacity-60 transition text-sm sm:text-base flex-1"
            >
              Delete
            </button>
          </div>

          <button
            onClick={clearTree}
            className="w-full px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-500 transition text-sm sm:text-base mb-2 sm:mb-3"
          >
            Clear
          </button>

          <div className="flex flex-col gap-2 mb-3 sm:mb-4">
            <label className="text-xs sm:text-sm text-gray-300">Speed (ms):</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="300"
                max="2000"
                step="100"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                className="flex-1 accent-green-500"
              />
              <span className="text-gray-300 text-xs sm:text-sm w-12 sm:w-14 text-right">{animationSpeed}</span>
            </div>
          </div>

          <div className="bg-gray-900 p-3 sm:p-4 rounded-lg h-48 sm:h-64 overflow-y-auto border border-gray-700">
            <h2 className="text-sm sm:text-lg font-semibold mb-2 text-green-400">Steps</h2>
            <div ref={stepsRef} className="text-xs sm:text-sm text-gray-200 space-y-1">
              {algorithmSteps.length > 0 ? (
                algorithmSteps.map((step, index) => (
                  <div key={index} className="text-green-300 py-1">
                    {step}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-xs">Perform an operation...</p>
              )}
            </div>
          </div>
        </div>

        {/* Tree Visualization */}
        <div
          ref={containerRef}
          className="bg-gray-800 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg lg:col-span-2 min-h-96 sm:min-h-[60vh] overflow-hidden border border-gray-700"
        >
          {d3Data ? (
            <Tree
              data={d3Data}
              orientation="vertical"
              translate={getTranslate()}
              zoomable
              collapsible={false}
              separation={{ siblings: isMobile ? 1.5 : 2, nonSiblings: isMobile ? 1.8 : 2.5 }}
              pathFunc="diagonal"
              renderCustomNodeElement={CustomNode}
              styles={{
                links: { stroke: "#10b981", strokeWidth: isMobile ? 2 : 3 },
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-500 text-center text-sm sm:text-base px-4">
                Enter values to visualize the AVL tree
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
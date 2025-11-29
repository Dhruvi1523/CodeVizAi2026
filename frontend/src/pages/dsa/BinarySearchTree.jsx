// src/pages/dsa/BinarySearchTree.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Tree from "react-d3-tree";

let NEXT_ID = 1;

const createNode = (value) => ({
  id: NEXT_ID++,
  value,
  left: null,
  right: null,
});

const cloneTree = (node) => {
  if (!node) return null;
  return {
    id: node.id,
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
};

const findValue = (node, value) => {
  if (!node) return false;
  if (node.value === value) return true;
  return value < node.value ? findValue(node.left, value) : findValue(node.right, value);
};

const insert = (root, value, frames = []) => {
  const insertRec = (node) => {
    if (!node) {
      const newNode = createNode(value);
      frames.push({ tree: cloneTree(newNode), msg: `Inserted ${value}` });
      return newNode;
    }

    const cloned = { ...node, left: node.left, right: node.right };

    if (value < node.value) {
      frames.push({
        tree: cloneTree(cloned),
        msg: `${value} < ${node.value} → go left`,
        highlight: node.id,
      });
      cloned.left = insertRec(node.left);
    } else if (value > node.value) {
      frames.push({
        tree: cloneTree(cloned),
        msg: `${value} > ${node.value} → go right`,
        highlight: node.id,
      });
      cloned.right = insertRec(node.right);
    } else {
      frames.push({ tree: cloneTree(cloned), msg: `Duplicate ${value} ignored`, highlight: node.id });
      return cloned;
    }
    return cloned;
  };

  const newRoot = insertRec(root);
  frames.push({ tree: cloneTree(newRoot), msg: `Insert complete` });
  return { newRoot, frames };
};

const deleteNode = (root, value, frames = []) => {
  const deleteRec = (node, target = value) => {
    if (!node) {
      frames.push({ tree: cloneTree(root), msg: `${target} not found` });
      return null;
    }

    const cloned = { ...node, left: node.left, right: node.right };

    if (target < node.value) {
      frames.push({ tree: cloneTree(cloned), msg: `Searching left...`, highlight: node.id });
      cloned.left = deleteRec(node.left, target);
    } else if (target > node.value) {
      frames.push({ tree: cloneTree(cloned), msg: `Searching right...`, highlight: node.id });
      cloned.right = deleteRec(node.right, target);
    } else {
      frames.push({ tree: cloneTree(cloned), msg: `Found ${target}, deleting...`, highlight: node.id });

      if (!cloned.left) {
        frames.push({ tree: cloneTree(cloned.right), msg: `Node deleted, right child moved up` });
        return cloned.right;
      }
      if (!cloned.right) {
        frames.push({ tree: cloneTree(cloned.left), msg: `Node deleted, left child moved up` });
        return cloned.left;
      }

      // find successor (leftmost in right subtree)
      let succ = cloned.right;
      while (succ.left) succ = succ.left;

      // copy successor's value/id into current spot
      cloned.value = succ.value;
      cloned.id = succ.id;

      frames.push({ tree: cloneTree(cloned), msg: `Replaced with successor ${succ.value}`, highlight: cloned.id });

      // remove the successor node from the right subtree by deleting succ.value
      cloned.right = deleteRec(cloned.right, succ.value);
    }
    return cloned;
  };

  const newRoot = deleteRec(root);
  frames.push({ tree: newRoot ? cloneTree(newRoot) : null, msg: `Delete complete` });
  return { newRoot, frames };
};

const toD3 = (node, highlightId = null) => {
  if (!node) return null;

  const hasLeft = !!node.left;
  const hasRight = !!node.right;

  const children = [];
  if (hasLeft) children.push(toD3(node.left, highlightId));
  if (hasRight) children.push(toD3(node.right, highlightId));

  // If only one child exists, add an invisible placeholder on the other side
  // so the real child will render to left/right of the parent instead of centered.
  if (!hasLeft && hasRight) {
    // add left placeholder so right child appears on the right
    children.unshift({
      name: "",
      attributes: { placeholder: true },
      children: undefined,
    });
  } else if (hasLeft && !hasRight) {
    // add right placeholder so left child appears on the left
    children.push({
      name: "",
      attributes: { placeholder: true },
      children: undefined,
    });
  }

  return {
    name: String(node.value),
    attributes: { id: node.id, isHighlighted: node.id === highlightId },
    children: children.length ? children : undefined,
  };
};

export default function BinarySearchTree() {
  const [root, setRoot] = useState(null);
  const [d3Data, setD3Data] = useState(null);
  const [input, setInput] = useState("");
  const [speed, setSpeed] = useState(1000);
  const [isAnimating, setIsAnimating] = useState(false);
  const [log, setLog] = useState([]);
  const [currentHighlight, setCurrentHighlight] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef(null);
  const logRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setD3Data(root ? toD3(root, currentHighlight) : null);
  }, [root, currentHighlight]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  const getTranslate = () => {
    if (!containerRef.current) return { x: 300, y: 80 };
    const { width, height } = containerRef.current.getBoundingClientRect();
    return { x: width / 2, y: Math.max(60, height * 0.1) };
  };

  const playAnimation = async (frames) => {
    setIsAnimating(true);
    for (const frame of frames) {
      setD3Data(frame.tree ? toD3(frame.tree, frame.highlight || null) : null);
      setCurrentHighlight(frame.highlight || null);
      setLog((prev) => [...prev.slice(-100), frame.msg]);
      await new Promise((r) => setTimeout(r, speed));
    }
    setCurrentHighlight(null);
    setIsAnimating(false);
  };

  const handleInsert = async () => {
    if (isAnimating) return;
    const val = parseInt(input, 10);
    if (isNaN(val)) {
      setLog((l) => [...l, "Please enter a valid number"]);
      return;
    }

    if (root && findValue(root, val)) {
      setLog((l) => [...l, `Duplicate ${val} not allowed`]);
      setInput("");
      return;
    }

    const { newRoot, frames } = insert(root, val);
    setRoot(newRoot);
    await playAnimation(frames);
    setInput("");
  };

  const handleDelete = async () => {
    if (isAnimating || !root) return;
    const val = parseInt(input, 10);
    if (isNaN(val)) {
      setLog((l) => [...l, "Invalid number"]);
      return;
    }

    const { newRoot, frames } = deleteNode(root, val);
    setRoot(newRoot);
    await playAnimation(frames);
    setInput("");
  };

  const handleClear = () => {
    NEXT_ID = 1;
    setRoot(null);
    setD3Data(null);
    setLog([]);
    setInput("");
  };

  const CustomNode = ({ nodeDatum }) => {
    const isPlaceholder = nodeDatum.attributes?.placeholder;
    if (isPlaceholder) return <g />;

    const nodeRadius = isMobile ? 24 : 30;
    const textSize = isMobile ? 14 : 18;

    return (
      <g>
        <circle
          r={nodeRadius}
          fill="#ffffff"
          stroke="#10b981"
          strokeWidth={3}
        />
        <text
          textAnchor="middle"
          dy=".3em"
          fontSize={textSize}
          fontWeight="bold"
          fill="#000000"
        >
          {nodeDatum.name}
        </text>
      </g>
    );
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
          <h1 className="text-lg sm:text-2xl font-bold text-gray-100">Binary Search Tree</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Insert, Delete & Search visualization</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 auto-rows-max lg:auto-rows-auto">
        <div className="bg-gray-800 p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-lg lg:row-span-2">
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInsert()}
            placeholder="Enter value"
            className="w-full p-2 sm:p-3 rounded-lg border border-gray-700 bg-gray-900 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 mb-2 sm:mb-4 text-sm sm:text-base"
            disabled={isAnimating}
          />

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-2 sm:mb-4">
            <button
              onClick={handleInsert}
              disabled={isAnimating}
              className="flex-1 py-2 sm:py-3 bg-green-600 hover:bg-green-500 disabled:opacity-60 rounded-lg font-bold text-white transition text-sm sm:text-base"
            >
              Insert
            </button>
            <button
              onClick={handleDelete}
              disabled={isAnimating || !root}
              className="flex-1 py-2 sm:py-3 bg-red-600 hover:bg-red-500 disabled:opacity-60 rounded-lg font-bold text-white transition text-sm sm:text-base"
            >
              Delete
            </button>
          </div>

          <button
            onClick={handleClear}
            className="w-full py-2 sm:py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-white transition mb-2 sm:mb-6 text-sm sm:text-base"
          >
            Clear
          </button>

          <div className="flex items-center gap-2 mb-3 sm:mb-6">
            <label className="text-xs sm:text-sm text-gray-300">Speed:</label>
            <input
              type="range"
              min="300"
              max="2000"
              step="100"
              value={speed}
              onChange={(e) => setSpeed(+e.target.value)}
              className="flex-1 accent-green-500"
            />
            <span className="text-xs sm:text-sm text-gray-300 w-12 sm:w-16 text-right">{speed}ms</span>
          </div>

          <div className="bg-gray-900 p-3 sm:p-4 rounded-lg max-h-48 sm:max-h-64 overflow-y-auto border border-gray-700">
            <h2 className="text-sm sm:text-lg font-semibold mb-2 text-green-400">Steps</h2>
            <div ref={logRef} className="text-xs sm:text-sm text-gray-300 space-y-1 font-mono">
              {log.length === 0 ? (
                <p className="text-gray-500 text-xs">Perform an operation...</p>
              ) : (
                log.map((msg, i) => (
                  <div key={i} className="text-green-300">
                    {msg}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div
          ref={containerRef}
          className="bg-gray-800 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg overflow-hidden lg:col-span-2 min-h-96 sm:min-h-[60vh] border border-gray-700"
        >
          {d3Data ? (
            <Tree
              data={d3Data}
              orientation="vertical"
              translate={getTranslate()}
              zoomable={true}
              collapsible={false}
              separation={{ siblings: isMobile ? 1.5 : 1.8, nonSiblings: isMobile ? 1.8 : 2.2 }}
              pathFunc="diagonal"
              renderCustomNodeElement={CustomNode}
              styles={{
                links: {
                  stroke: "#10b981",
                  strokeWidth: isMobile ? 2 : 3,
                },
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-center px-4">
              <p className="text-gray-500 text-sm sm:text-lg">Enter values and use buttons to visualize the tree.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
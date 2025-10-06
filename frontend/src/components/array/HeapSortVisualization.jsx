import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ----------------- Compute Tree Positions -----------------
function computeTreePositions(array, options = {}) {
  if (!array || array.length === 0) return {};

  const {
    baseWidth = 600, // default min width
    levelHeight = 60,
    topMargin = 50,
    nodeSpacing = 40, // horizontal spacing per node
    xPadding = 20,
  } = options;

  const positions = {};

  // Calculate max depth of the tree
  const depth = Math.floor(Math.log2(array.length)) + 1;

  // Dynamically calculate width based on the maximum number of nodes in the last level
  const maxNodesInLastLevel = Math.pow(2, depth - 1);
  const width = Math.max(
    baseWidth,
    maxNodesInLastLevel * nodeSpacing + 2 * xPadding
  );

  // Recursive function to assign positions
  function assignPos(index, level, xStart, xEnd) {
    if (index >= array.length) return;

    const y = topMargin + level * levelHeight;
    const x = (xStart + xEnd) / 2;
    positions[index] = { x, y };

    const left = 2 * index + 1;
    const right = 2 * index + 2;

    if (left < array.length) assignPos(left, level + 1, xStart, x);
    if (right < array.length) assignPos(right, level + 1, x, xEnd);
  }

  assignPos(0, 0, xPadding, width - xPadding);
  return positions;
}

// ----------------- Animated Curved Arrow -----------------
function HeapifyArrow({ from, to, color }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const curvature = 0.25;
  const controlX = from.x + dx * curvature;
  const controlY = from.y + dy * 0.4;
  const path = `M${from.x},${from.y} Q${controlX},${controlY} ${to.x},${to.y}`;

  return (
    <motion.path
      d={path}
      stroke={color}
      strokeWidth={4}
      fill="transparent"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      exit={{ pathLength: 0, opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      markerEnd="url(#arrowhead)"
    />
  );
}

// ----------------- Heap Tree -----------------
function HeapTree({ nodes, positions, step }) {
  if (!nodes?.length) return null;

  // Draw lines
  const lines = nodes.flatMap((node) => {
    const left = 2 * node.index + 1;
    const right = 2 * node.index + 2;
    return [left, right]
      .filter((child) => child < nodes.length)
      .map((child) => (
        <motion.line
          key={`line-${node.value}-${child}`}
          x1={positions[node.index].x}
          y1={positions[node.index].y}
          x2={positions[child].x}
          y2={positions[child].y}
          stroke="#64748b"
          strokeWidth={2}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        />
      ));
  });

  // Draw nodes
  // ----------------- inside HeapTree component -----------------
  const nodeElements = nodes.map((node) => {
    const colors = {
      normal: { fill: "#3b82f6", stroke: "#1d4ed8" },
      comparing: { fill: "#facc15", stroke: "#b45309" },
      swapped: { fill: "#22c55e", stroke: "#15803d" },
      extracted: { fill: "#14b8a6", stroke: "#0f766e" }, // teal for extracted
      heapify: { fill: "#9333ea", stroke: "#7e22ce" },
    };

    let state = "normal";
    if (step?.comparing?.includes(node.index)) state = "comparing";
    if (step?.swapped?.includes(node.index)) state = "swapped";
    if (step?.extracted?.includes(node.index)) state = "extracted";
    if (step?.heapifySubtree?.includes(node.index) && state === "normal")
      state = "heapify";

    const { fill, stroke } = colors[state] || colors.normal;

    return (
      <motion.g
        key={node.value}
        layoutId={`node-${node.value}`}
        animate={{
          x: positions[node.index].x,
          y: positions[node.index].y,
          scale: state === "heapify" ? 1.15 : state === "comparing" ? 1.1 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <motion.circle r={20} fill={fill} stroke={stroke} strokeWidth={3} />
        <motion.text
          x={0}
          y={5}
          textAnchor="middle"
          fontSize={16}
          fontWeight={
            state === "swapped" || state === "comparing" ? "bold" : "normal"
          }
          fill={["comparing", "swapped"].includes(state) ? "#000" : "#fff"}
        >
          {node.value}
        </motion.text>
      </motion.g>
    );
  });

  let arrow = null;
  if (step?.comparing?.length === 2) {
    const [a, b] = step.comparing;
    arrow = (
      <HeapifyArrow
        from={positions[a]}
        to={positions[b]}
        color="#facc15"
        key={`arrow-compare-${a}-${b}`}
      />
    );
  } else if (step?.swapped?.length === 2) {
    const [a, b] = step.swapped;
    arrow = (
      <HeapifyArrow
        from={positions[a]}
        to={positions[b]}
        color="#22c55e"
        key={`arrow-swap-${a}-${b}`}
      />
    );
  }

  return (
    <>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="8"
          refX="4"
          refY="3"
          orient="auto"
          fill="currentColor"
        >
          <path d="M0,0 L0,6 L6,3 z" fill="currentColor" />
        </marker>
      </defs>

      <g>{lines}</g>
      <AnimatePresence>{arrow}</AnimatePresence>
      <AnimatePresence>{nodeElements}</AnimatePresence>
    </>
  );
}

// ----------------- Legend Component -----------------
function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded ${color}`} />
      <span className="text-white text-sm">{label}</span>
    </div>
  );
}

// ----------------- Main Visualization -----------------
export default function HeapSortTreeVisualization({ step }) {
  const positions = useMemo(
    () => computeTreePositions(step?.array || []),
    [step?.array]
  );

  const nodes = useMemo(() => {
    if (!step?.array) return [];
    return step.array.map((val, idx) => ({ index: idx, value: val }));
  }, [step]);

  // ----------------- Explanation Panel -----------------
  const explanation = useMemo(() => {
    if (!step)
      return {
        title: "⏳ Heap Sort",
        message: "Initializing visualization...",
      };

    if (step.phase === "build") {
      return {
        title: "🔧 Building Max Heap",
        message:
          step.explanation ||
          "We build a max-heap from the array by heapifying each subtree. Purple nodes show the subtree being processed.",
      };
    }
    if (step.phase === "heapify") {
      return {
        title: "🔁 Heapify Subtree",
        message:
          step.explanation ||
          `Heapifying subtree rooted at index ${step.heapifyRoot} (value: ${
            step.array[step.heapifyRoot]
          }). Ensuring max-heap property for this subtree.`,
      };
    }
    if (step.phase === "extract") {
      return {
        title: "🎯 Extract Maximum",
        message:
          step.explanation ||
          `Swapping root (${
            step.array[step.swapped?.[0]]
          }) with last unsorted element (${
            step.array[step.swapped?.[1]]
          }) and removing it. Green nodes indicate swap.`,
      };
    }
    if (step.phase === "sorted") {
      return {
        title: "✅ Sorting Complete",
        message: "All elements are now sorted in ascending order.",
      };
    }

    return {
      title: "⚙️ Heap Sort",
      message: step.explanation || "Running heap sort...",
    };
  }, [step]);

  return (
    <div className="p-4 bg-[#1e293b] h-full rounded-lg flex flex-col items-center overflow-auto">
      {/* Legends */}
      <div className="flex gap-4 mb-4 flex-wrap justify-center items-center">
        <Legend color="bg-blue-500" label="Normal" />
        <Legend color="bg-yellow-400" label="Comparing" />
        <Legend color="bg-green-500" label="Swapped" />
        <Legend color="bg-red-500" label="Extracted" />
        <Legend color="bg-purple-500" label="Heapify Subtree" />
        <Legend color="bg-teal-500" label="Extracted" />
      </div>

      {/* Array Snapshot */}
      {step && (
        <div className="flex gap-2 mb-4 flex-wrap justify-center">
          <AnimatePresence>
            {step.array.map((val, idx) => {
              const isHighlighted = step.comparing?.includes(idx);
              const isSwapped = step.swapped?.includes(idx);
              const isSorted = step.sorted?.includes(idx);
              const isExtracted = step.extracted?.includes(idx);
              const isHeapify = step.heapifySubtree?.includes(idx);

              let bg = "bg-blue-500 border-blue-700 text-white";
              if (isHighlighted)
                bg = "bg-yellow-400 border-yellow-600 text-gray-900";
              if (isSwapped) bg = "bg-green-500 border-green-700 text-white";
              if (isSorted) bg = "bg-teal-500 border-teal-700 text-white";
              if (isExtracted) bg = "bg-red-500 border-red-700 text-white";
              if (isHeapify && !isHighlighted && !isSwapped && !isExtracted)
                bg = "bg-purple-500 border-purple-700 text-white";

              return (
                <motion.div
                  key={idx}
                  layoutId={`array-${idx}`}
                  layout
                  className={`w-10 h-10 flex items-center justify-center font-bold border-2 rounded-lg ${bg}`}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {val}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Heap Tree + Explanation */}
      <div className="grid grid-cols-4 gap-6 w-full max-w-[1100px]">
        {/* Explanation Panel (1 column) */}
        <motion.div
          layout
          className="col-span-1 bg-gray-800/90 text-white p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col justify-start text-left overflow-auto max-h-[300px]"
        >
          <h2 className="text-xl font-bold text-teal-400 mb-3">
            {explanation.title}
          </h2>
          <p className="text-gray-300 leading-relaxed">{explanation.message}</p>
        </motion.div>

        {/* Tree Area (3 columns) */}
        <div
          className="col-span-3 overflow-auto flex justify-center items-start "
          style={{ height: 300}}
        >
          <motion.svg width={1200} height={350} style={{ overflow: "scroll" }}>
            <HeapTree nodes={nodes} positions={positions} step={step} />
          </motion.svg>
        </div>
      </div>
    </div>
  );
}

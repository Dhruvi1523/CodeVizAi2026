import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ----------------- Compute Tree Positions -----------------
function computeTreePositions(array, width = 800, levelHeight = 80) {
  if (!array || array.length === 0) return {};

  const positions = {};

  function assignPos(index, x, y, gap = 160) {
    if (index >= array.length) return;
    positions[index] = { x, y };
    assignPos(2 * index + 1, x - gap / Math.pow(y / levelHeight + 1, 0.7), y + levelHeight, gap);
    assignPos(2 * index + 2, x + gap / Math.pow(y / levelHeight + 1, 0.7), y + levelHeight, gap);
  }

  assignPos(0, width / 2, 50);
  return positions;
}

// ----------------- Heap Tree Value Animation -----------------
function HeapTree({ nodes, positions }) {
  if (!nodes || nodes.length === 0) return null;

  // Draw static lines between parent and children
  const lines = nodes.map((node) => {
    const left = 2 * node.index + 1;
    const right = 2 * node.index + 2;
    return (
      <React.Fragment key={`line-${node.index}`}>
        {left < nodes.length && (
          <line
            x1={positions[node.index].x}
            y1={positions[node.index].y}
            x2={positions[left].x}
            y2={positions[left].y}
            stroke="#888"
            strokeWidth={2}
          />
        )}
        {right < nodes.length && (
          <line
            x1={positions[node.index].x}
            y1={positions[node.index].y}
            x2={positions[right].x}
            y2={positions[right].y}
            stroke="#888"
            strokeWidth={2}
          />
        )}
      </React.Fragment>
    );
  });

  // Draw animated value circles
  const nodeElements = nodes.map((node) => {
    const fill =
      node.state === "extracted"
        ? "#f87171"
        : node.state === "swapped"
        ? "#22c55e"
        : node.state === "comparing"
        ? "#facc15"
        : "#3b82f6";

    const stroke =
      node.state === "extracted"
        ? "#b91c1c"
        : node.state === "swapped"
        ? "#16a34a"
        : node.state === "comparing"
        ? "#b45309"
        : "#1d4ed8";

    return (
      <React.Fragment key={node.index}>
        <motion.circle
          layoutId={`node-${node.index}`}
          cx={positions[node.index].x}
          cy={positions[node.index].y}
          r={20}
          fill={fill}
          stroke={stroke}
          strokeWidth={3}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
        <motion.text
          layoutId={`node-text-${node.index}`}
          x={positions[node.index].x}
          y={positions[node.index].y + 5}
          textAnchor="middle"
          fontSize={16}
          fontWeight={node.state === "swapped" || node.state === "comparing" ? "bold" : "normal"}
          fill={node.state === "swapped" || node.state === "comparing" || node.state === "extracted" ? "#000" : "#fff"}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {node.value}
        </motion.text>
      </React.Fragment>
    );
  });

  return (
    <>
      <g>{lines}</g>
      <g>{nodeElements}</g>
    </>
  );
}

// ----------------- Main HeapSort Tree Visualization -----------------
export default function HeapSortTreeVisualization({ step }) {
  const positions = useMemo(() => computeTreePositions(step?.array || []), [step?.array]);

  // Convert array to nodes with state
  const nodes = useMemo(() => {
    if (!step?.array) return [];
    return step.array.map((val, idx) => {
      let state = "normal";
      if (step.comparing?.includes(idx)) state = "comparing";
      if (step.swapped?.includes(idx)) state = "swapped";
      if (step.extracted?.includes(idx)) state = "extracted";
      return { index: idx, value: val, state };
    });
  }, [step]);

  return (
    <div className="p-4 bg-[#1e2939] min-h-[600px] rounded-lg flex flex-col items-center">
      {/* Array Snapshot */}
      {step && (
        <div className="flex gap-2 mb-4 flex-wrap justify-center">
          {step.array.map((val, idx) => {
            const isHighlighted = step.comparing?.includes(idx);
            const isSwapped = step.swapped?.includes(idx);
            const isSorted = step.sorted?.includes(idx);
            const isExtracted = step.extracted?.includes(idx);

            let bg = "bg-blue-500 border-blue-700 text-white";
            if (isHighlighted) bg = "bg-yellow-400 border-yellow-600 text-gray-900";
            if (isSwapped) bg = "bg-green-500 border-green-700 text-white";
            if (isSorted) bg = "bg-teal-500 border-teal-700 text-white";
            if (isExtracted) bg = "bg-red-500 border-red-700 text-white";

            return (
              <div
                key={idx}
                className={`w-10 h-10 flex items-center justify-center font-bold border-2 rounded-lg ${bg}`}
              >
                {val}
              </div>
            );
          })}
        </div>
      )}

      {/* Explanation Panel */}
      <div className="bg-gray-800 text-white p-3 rounded mb-4 w-full max-w-[900px] h-28 overflow-y-auto">
        {step?.comparing?.length
          ? `Comparing ${step.array[step.comparing[0]]} and ${step.array[step.comparing[1]]}`
          : step?.swapped?.length
          ? `Swapped ${step.array[step.swapped[0]]} and ${step.array[step.swapped[1]]}`
          : step?.extracted?.length
          ? `Extracted max elements: ${step.extracted.map((i) => step.array[i]).join(", ")}`
          : step?.sorted
          ? `Finalized indices: ${step.sorted.join(", ")}`
          : "Building heap..."}
      </div>

      {/* Heap Tree */}
      <div className="overflow-auto w-full flex justify-center" style={{ height: 400 }}>
        <svg width={900} height={400} style={{ overflow: "visible" }}>
          <HeapTree nodes={nodes} positions={positions} />
        </svg>
      </div>
    </div>
  );
}

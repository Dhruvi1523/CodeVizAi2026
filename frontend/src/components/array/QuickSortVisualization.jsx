import React from "react";
import { motion } from "framer-motion";

/* ------------------ Recursive Node Renderer ------------------ */
const PartitionNode = ({ step }) => {
  if (!step) return null;
  const {
    array,
    pivotIndex,
    comparing,
    swapped,
    placedPivot,
    left,
    right,
    low,
    high,
    finalized,
    depth,
  } = step;

  // Only show subarray if length > 1
  const showSubarray =
    typeof low === "number" && typeof high === "number" && high - low > 0;

  return (
    <div className="relative flex flex-col items-center mb-12 mt-5">
      {/* Depth indicator */}
      {showSubarray && (
        <div className="absolute -top-6 text-sm text-gray-300 font-medium mb-3">
          Depth: {depth}
        </div>
      )}

      {/* Active subarray highlight */}
      {showSubarray && (
        <div
          className="absolute rounded-md bg-slate-700/100 mt-2"
          style={{
            width: `${(high - low + 1) * 50 + 33}px`,
            height: "57px ",
            top: -5,
            left: `${low * 50 - 4}px`,
          }}
        />
      )}

      {/* Array row */}
      <motion.div className="flex gap-2 relative z-10 mt-2">
        {array.map((val, i) => {
          const isPivot = i === pivotIndex;
          const isComparing = comparing?.includes(i);
          const isSwapped = swapped?.includes(i);
          const isPlaced = placedPivot === i;
          const isFinalized = finalized?.includes(i);

          let bg = "bg-blue-500 text-white border-blue-700"; // normal
          if (isFinalized) bg = "bg-teal-500 text-white border-teal-700";
          if (isPivot) bg = "bg-yellow-400 text-gray-900 border-yellow-600";
          if (isComparing) bg = "bg-purple-400 text-white border-purple-600";
          if (isSwapped) bg = "bg-green-500 text-white border-green-700";
          if (isPlaced) bg = "bg-orange-500 text-white border-orange-700";

          return (
            <motion.div
              key={i}
              layout
              animate={{
                scale:
                  isPivot && isPlaced ? [1, 1.4, 1] : isComparing ? 1.2 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold shadow border-2 ${bg}`}
            >
              {val}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Left & Right subtrees */}
      {(left && left.array.length > 1) || (right && right.array.length > 1) ? (
        <div className="flex justify-center gap-24 mt-6">
          {left && left.array.length > 1 && <PartitionNode step={left} />}
          {right && right.array.length > 1 && <PartitionNode step={right} />}
        </div>
      ) : null}
    </div>
  );
};

/* ------------------ Main QuickSort Component ------------------ */
export default function QuickSortVisualization({ step }) {
  const getExplanation = (step) => {
    if (!step) return "Waiting for initialization...";
    const {
      action,
      comparing,
      swapped,
      pivotIndex,
      array,
      low,
      high,
      depth,
    } = step;

    const showSubarray =
      typeof low === "number" && typeof high === "number" && high - low > 0;
    const subarray = showSubarray ? `Subarray [${low} ... ${high}]` : "";

    switch (action) {
      case "compare":
        return (
          <span>
            {subarray}: Comparing <strong>{array[comparing[0]]}</strong> with
            pivot <strong>{array[comparing[1]]}</strong> (Depth: {depth})
          </span>
        );
      case "swap":
        const a = array[swapped[0]];
        const b = array[swapped[1]];
        const reason =
          a <= array[pivotIndex]
            ? `${a} <= pivot ${array[pivotIndex]}`
            : `${a} > pivot ${array[pivotIndex]}`;
        return (
          <span>
            {subarray}: Swapping <strong>{a}</strong> and <strong>{b}</strong>{" "}
            because {reason} (Depth: {depth})
          </span>
        );
      case "select-pivot":
        return (
          <span>
            {subarray}: Pivot selected : <strong>{array[pivotIndex]}</strong>{" "}
            (Depth: {depth})
          </span>
        );
      case "place-pivot":
        return (
          <span>
            {subarray}: Pivot <strong>{array[pivotIndex]}</strong> placed at
            correct position (Depth: {depth})
          </span>
        );
      case "partition":
        return (
          <span>
            {subarray}: Partitioning array around pivot{" "}
            <strong>{array[pivotIndex]}</strong> (Depth: {depth})
          </span>
        );
      case "done-node":
        return (
          <span>
            {subarray}: Subarray sorted : [
            <strong>{array.slice(low, high + 1).join(", ")}</strong>] (Depth:{" "}
            {depth})
          </span>
        );
      case "done":
        return (
          <span>
            QuickSort complete! Final sorted array: [
            <strong>{array.join(", ")}</strong>]
          </span>
        );
      default:
        return "";
    }
  };

  return (
    <div className="w-full overflow-x-auto bg-[#1e2939] rounded-lg border border-gray-700 p-6 min-w-[900px] flex flex-col items-center">
      {/* Explanation Panel */}
      <div className="mb-6 p-4 bg-[#111827] rounded-lg shadow text-sm text-white font-medium overflow-y-auto max-h-32">
        {getExplanation(step)}
      </div>

      {/* Tree Visualization */}
      {!step ? (
        <div className="flex items-center justify-center p-16 text-gray-400">
          Waiting for initialization...
        </div>
      ) : (
        <PartitionNode step={step} />
      )}

      {/* Full array snapshot */}
      {step && (
        <div className="flex mt-6 gap-2 justify-center flex-wrap">
          {step.array.map((val, i) => {
            const isActive =
              i >= step.low && i <= step.high && step.high - step.low > 0;
            const isFinalized = step.finalized?.includes(i);
            let bg = "bg-gray-800 text-gray-400 border-gray-700";
            if (isActive) bg = "bg-gray-600 text-white border-gray-500";
            if (isFinalized) bg = "bg-teal-500 text-white border-teal-700";

            return (
              <div
                key={i}
                className={`w-10 h-10 flex items-center justify-center rounded border ${bg}`}
              >
                {val}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6 text-sm text-gray-300 mt-5">
        <Legend color="bg-blue-500 border-blue-700" label="Normal" />
        <Legend color="bg-yellow-400 border-yellow-600" label="Pivot" />
        <Legend color="bg-purple-500 border-purple-700" label="Comparing" />
        <Legend color="bg-green-500 border-green-700" label="Swapped" />
        <Legend color="bg-orange-500 border-orange-700" label="Pivot Placed" />
        <Legend color="bg-teal-500 border-teal-700" label="Finalized" />
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2 mt-5">
      <div className={`w-8 h-8 rounded border-2 ${color}`} />
      <span>{label}</span>
    </div>
  );
}

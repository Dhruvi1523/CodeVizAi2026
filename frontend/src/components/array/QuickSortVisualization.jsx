import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------ Pivot Strategy Explanation Component ------------------ */
const PivotExplanationCard = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "📍 Step 1: Why Do We Need a Pivot?",
      content: "QuickSort works by dividing the array into smaller parts. The pivot is our 'reference point' that helps us split the array into two groups: elements smaller than pivot and elements larger than pivot.",
      visual: (
        <div className="flex flex-col items-center gap-3 bg-black/30 p-4 rounded-lg">
          <div className="text-gray-300 text-sm">Original Array:</div>
          <div className="flex gap-2">
            <div className="w-12 h-12 bg-blue-500 border-2 border-blue-700 rounded flex items-center justify-center text-white font-bold">8</div>
            <div className="w-12 h-12 bg-blue-500 border-2 border-blue-700 rounded flex items-center justify-center text-white font-bold">3</div>
            <div className="w-12 h-12 bg-blue-500 border-2 border-blue-700 rounded flex items-center justify-center text-white font-bold">1</div>
            <div className="w-12 h-12 bg-blue-500 border-2 border-blue-700 rounded flex items-center justify-center text-white font-bold">7</div>
            <div className="w-12 h-12 bg-yellow-400 border-2 border-yellow-600 rounded flex items-center justify-center text-gray-900 font-bold">5</div>
          </div>
          <div className="text-yellow-300 text-sm mt-2">We need to pick ONE element as pivot to compare others against it</div>
        </div>
      )
    },
    {
      title: "🎯 Step 2: Why Last Element?",
      content: "We choose the LAST element as pivot because it's simple and predictable. When we partition, we can easily swap elements without losing track of our pivot position. It stays at the end while we work from the beginning.",
      visual: (
        <div className="flex flex-col items-center gap-3 bg-black/30 p-4 rounded-lg">
          <div className="flex gap-2 items-center">
            <div className="w-12 h-12 bg-blue-500 border-2 border-blue-700 rounded flex items-center justify-center text-white font-bold">8</div>
            <div className="w-12 h-12 bg-blue-500 border-2 border-blue-700 rounded flex items-center justify-center text-white font-bold">3</div>
            <div className="w-12 h-12 bg-blue-500 border-2 border-blue-700 rounded flex items-center justify-center text-white font-bold">1</div>
            <div className="w-12 h-12 bg-blue-500 border-2 border-blue-700 rounded flex items-center justify-center text-white font-bold">7</div>
            <div className="relative">
              <div className="w-12 h-12 bg-yellow-400 border-2 border-yellow-600 rounded flex items-center justify-center text-gray-900 font-bold">5</div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-yellow-300 text-xs whitespace-nowrap">👆 Last</div>
            </div>
          </div>
          <div className="text-green-300 text-sm mt-4">✓ Easy to find: array[high]</div>
          <div className="text-green-300 text-sm">✓ Stays safe at end during swaps</div>
          <div className="text-green-300 text-sm">✓ Simple to implement</div>
        </div>
      )
    },
    {
      title: "🔄 Step 3: The Partitioning Process",
      content: "Once we pick the last element as pivot (5), we compare all other elements with it. Elements ≤ 5 go to the left side, elements > 5 go to the right side. The pivot stays at the end during this process.",
      visual: (
        <div className="flex flex-col items-center gap-3 bg-black/30 p-4 rounded-lg">
          <div className="text-gray-300 text-sm mb-2">Comparing with pivot = 5:</div>
          <div className="flex gap-2 items-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-red-500 border-2 border-red-700 rounded flex items-center justify-center text-white font-bold">8</div>
              <div className="text-red-300 text-xs mt-1">8 &gt; 5</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-500 border-2 border-green-700 rounded flex items-center justify-center text-white font-bold">3</div>
              <div className="text-green-300 text-xs mt-1">3 ≤ 5</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-500 border-2 border-green-700 rounded flex items-center justify-center text-white font-bold">1</div>
              <div className="text-green-300 text-xs mt-1">1 ≤ 5</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-red-500 border-2 border-red-700 rounded flex items-center justify-center text-white font-bold">7</div>
              <div className="text-red-300 text-xs mt-1">7 &gt; 5</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-yellow-400 border-2 border-yellow-600 rounded flex items-center justify-center text-gray-900 font-bold">5</div>
              <div className="text-yellow-300 text-xs mt-1">Pivot</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "✨ Step 4: After Partitioning",
      content: "After comparing all elements, we place the pivot in its correct sorted position. Now all elements to its left are smaller, and all elements to its right are larger. The pivot is now in its final sorted position!",
      visual: (
        <div className="flex flex-col items-center gap-3 bg-black/30 p-4 rounded-lg">
          <div className="text-gray-300 text-sm">After partitioning:</div>
          <div className="flex gap-2 items-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-500 border-2 border-green-700 rounded flex items-center justify-center text-white font-bold">3</div>
              <div className="text-green-300 text-xs mt-1">≤ 5</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-500 border-2 border-green-700 rounded flex items-center justify-center text-white font-bold">1</div>
              <div className="text-green-300 text-xs mt-1">≤ 5</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-orange-500 border-2 border-orange-700 rounded flex items-center justify-center text-white font-bold shadow-lg">5</div>
              <div className="text-orange-300 text-xs mt-1">✓ Sorted!</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-red-500 border-2 border-red-700 rounded flex items-center justify-center text-white font-bold">7</div>
              <div className="text-red-300 text-xs mt-1">&gt; 5</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-red-500 border-2 border-red-700 rounded flex items-center justify-center text-white font-bold">8</div>
              <div className="text-red-300 text-xs mt-1">&gt; 5</div>
            </div>
          </div>
          <div className="text-teal-300 text-sm mt-2">Now repeat this process on left and right subarrays!</div>
        </div>
      )
    }
  ];

  return (
    <div className="mb-4 p-5 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-yellow-900/30 rounded-lg border-2 border-purple-600/50 shadow-lg w-full max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
          🎓 Understanding Pivot Selection
        </h2>
        <div className="text-sm text-gray-400">
          Step {activeStep + 1} of {steps.length}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-4"
        >
          <h3 className="text-yellow-300 font-bold text-lg mb-3">{steps[activeStep].title}</h3>
          <p className="text-gray-200 text-sm leading-relaxed mb-4">
            {steps[activeStep].content}
          </p>
          {steps[activeStep].visual}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeStep === 0
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-purple-600 text-white hover:bg-purple-500"
          }`}
        >
          ← Previous
        </button>

        <div className="flex gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === activeStep
                  ? "bg-yellow-400 w-8"
                  : "bg-gray-600 hover:bg-gray-500"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
          disabled={activeStep === steps.length - 1}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeStep === steps.length - 1
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-purple-600 text-white hover:bg-purple-500"
          }`}
        >
          Next →
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-900/30 border border-blue-600/50 rounded-lg">
        <div className="text-blue-300 text-xs font-medium mb-1">💡 Key Insight:</div>
        <div className="text-gray-300 text-xs">
          The last element is chosen because it makes the algorithm simpler to implement. 
          While we could choose any element (first, middle, random, or even the median), 
          the last element strategy is easiest to understand and code!
        </div>
      </div>
    </div>
  );
};

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
    <div className="w-full h-screen overflow-y-auto overflow-x-auto bg-[#1e2939] rounded-lg border border-gray-700 p-6 min-w-[900px] flex flex-col items-center">
      {/* Interactive Pivot Explanation */}
      <PivotExplanationCard />

      {/* Scroll indicator */}
      <div className="my-6 flex flex-col items-center gap-2">
        <div className="text-yellow-400 font-semibold text-lg animate-pulse">
          ↓ Scroll Down to See Visualization ↓
        </div>
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full"></div>
      </div>

      {/* Explanation Panel */}
      <div className="mb-6 p-4 bg-[#111827] rounded-lg shadow text-sm text-white font-medium w-full max-w-3xl">
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
        <div className="flex mt-6 gap-2 justify-center flex-wrap max-w-3xl">
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
      <div className="flex items-center gap-4 mb-6 text-sm text-gray-300 mt-5 flex-wrap justify-center">
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

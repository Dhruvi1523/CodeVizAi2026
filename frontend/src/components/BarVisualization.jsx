// BarVisualization.jsx
import React from "react";
import { motion } from "framer-motion";
import { ArrowDown, Shuffle, ArrowRightLeft, Key, Info, MoveRight } from "lucide-react";

const BarVisualization = ({ step = {}, maxValue = 1 }) => {
  const safeArray = Array.isArray(step.array) ? step.array : [];

  const getBarColor = (index) => {
    if (step.sorted && step.sorted.includes(index)) return "bg-emerald-500"; // green = sorted
    if (step.placed && step.placed.index === index) return "bg-indigo-500"; // blue = placed
    if (step.shifted && (step.shifted.from === index || step.shifted.to === index)) return "bg-amber-400"; // yellow = shifted
    if (step.swapped && step.swapped.includes(index)) return "bg-amber-400"; // yellow = swapped
    if (step.comparing && step.comparing.includes(index)) return "bg-rose-500"; // red = comparing
    return "bg-slate-500"; // default gray
  };

  const getBarHeight = (value) => {
    if (value === null || value === undefined) return 4;
    const v = typeof value === "object" && "value" in value ? value.value : value;
    const m = Math.max(1, maxValue);
    return (Number(v) / m) * 300;
  };

  const displayValue = (value) => {
    if (value === null || value === undefined) return "";
    return typeof value === "object" && "value" in value ? value.value : value;
  };

  const renderComparisonLine = () => {
    if (step.comparison) {
      const { left, right, operator, result } = step.comparison;
      return (
        <div className="flex items-center space-x-2">
          <ArrowRightLeft size={16} className="text-rose-500" />
          <span>
            <span className="font-medium">{left}</span> {operator}{" "}
            <span className="font-medium">{right}</span>{" "}
            <span
              className={`ml-1 ${
                result ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"
              }`}
            >
              {String(result)}
            </span>
          </span>
        </div>
      );
    }

    if (step.comparing && step.comparing.length > 0) {
      if (step.comparing.length === 1) {
        const idx = step.comparing[0];
        const leftVal = displayValue(safeArray[idx]);
        const keyLabel = step.keyInHand ? (
          <span className="text-indigo-300 font-semibold">{step.keyInHand.value}</span>
        ) : (
          <span className="font-medium">key</span>
        );
        return (
          <div className="flex items-center space-x-2">
            <ArrowRightLeft size={16} className="text-rose-500" />
            <span>
              {leftVal}, {keyLabel}
            </span>
          </div>
        );
      } else {
        return (
          <div className="flex items-center space-x-2">
            <ArrowRightLeft size={16} className="text-rose-500" />
            <span>
              {step.comparing.map((idx, i) => (
                <span key={idx}>
                  {displayValue(safeArray[idx])}
                  {i < step.comparing.length - 1 ? " ↔ " : ""}
                </span>
              ))}
            </span>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6 h-full flex items-end justify-center space-x-1 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-x-0 bottom-0 h-full pointer-events-none opacity-10">
        <div className="h-1/3 border-t border-dashed border-gray-600"></div>
        <div className="h-1/3 border-t border-dashed border-gray-600"></div>
        <div className="h-1/3 border-t border-dashed border-gray-600"></div>
      </div>

      {/* Bars */}
      {safeArray.map((value, index) => (
        <motion.div
          key={`bar-${index}-${displayValue(value)}`}
          className="rounded-t-sm flex-1 max-w-12 relative flex flex-col justify-end items-center"
          style={{ height: getBarHeight(value) }}
          initial={{ height: 0 }}
          animate={{ height: getBarHeight(value) }}
          transition={{ duration: 0.28, ease: "easeInOut" }}
        >
          {step.keyInHand && step.keyInHand.originalIndex === index && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.18 }}
              className="absolute -top-8 text-indigo-400"
            >
              <ArrowDown size={20} />
            </motion.div>
          )}

          <div className={`w-full ${getBarColor(index)} h-full rounded-t-sm relative`}>
            {value !== null && value !== undefined && (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                {displayValue(value)}
              </div>
            )}
            {value === null && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                ⎯
              </div>
            )}
          </div>

          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-400">
            {index}
          </div>
        </motion.div>
      ))}

      {/* Legend / Explanation */}
      <div className="absolute top-4 left-4 w-80 p-4 bg-[#0f172a] text-[#e6eef6] rounded-lg text-sm shadow-xl space-y-3">
        {renderComparisonLine()}

        {step.shifted && (
          <div className="flex items-start space-x-2">
            <MoveRight size={16} className="text-amber-400 mt-0.5" />
            <span>
              <span className="font-medium">{displayValue(step.shifted.value)}</span> from{" "}
              {step.shifted.from} → {step.shifted.to}{" "}
              <span className="text-slate-400">({step.shifted.reason})</span>
            </span>
          </div>
        )}

        {step.swapped && (
          <div className="flex items-start space-x-2">
            <Shuffle size={16} className="text-amber-400 mt-0.5" />
            <span>
              <span className="font-medium">
                {step.swapped.map((i) => displayValue(safeArray[i])).join(" ↔ ")}
              </span>{" "}
              <span className="text-slate-400">(indices: {step.swapped.join(", ")})</span>
            </span>
          </div>
        )}

        {step.placed && (
          <div className="flex items-start space-x-2">
            <ArrowDown size={16} className="text-indigo-500 mt-0.5" />
            <span>
              <span className="font-medium">{displayValue(step.placed.value)}</span> at index{" "}
              {step.placed.index}
            </span>
          </div>
        )}

        {typeof step.minIndex === "number" && (
          <div className="flex items-start space-x-2">
            <ArrowRightLeft size={16} className="text-yellow-200 mt-0.5" />
            <span>
              Current min:{" "}
              <span className="font-medium">
                {displayValue(safeArray[step.minIndex])} (idx {step.minIndex})
              </span>
            </span>
          </div>
        )}

        {step.keyInHand && (
          <div className="flex items-start space-x-2">
            <Key size={16} className="text-indigo-400 mt-0.5" />
            <span>
              Key: <span className="font-medium">{step.keyInHand.value}</span>
            </span>
          </div>
        )}

        {step.explanation && (
          <div className="flex items-start space-x-2">
            <Info size={16} className="text-slate-300 mt-0.5" />
            <span className="text-xs italic text-slate-300">{step.explanation}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarVisualization;

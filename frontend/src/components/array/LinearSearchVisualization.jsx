import React from "react";
import { motion } from "framer-motion";
import { ArrowDown, Search, CheckCircle2, Info } from "lucide-react";
import { useRef , useEffect } from "react";
const LinearSearchArrayVisualization = ({ step = {} }) => {
  const safeArray = Array.isArray(step.array) ? step.array : [];
  const scrollRef = useRef(null);
  const cellRefs = useRef([]);

  // Auto-scroll to comparing element
  useEffect(() => {
    if (scrollRef.current && step.comparing && step.comparing.length > 0) {
      const compareIndex = step.comparing[0];
      const cell = cellRefs.current[compareIndex];
      if (cell && scrollRef.current) {
        const scrollLeft =
          cell.offsetLeft -
          scrollRef.current.offsetWidth / 2 +
          cell.offsetWidth / 2;
        scrollRef.current.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
      }
    }
  }, [step.comparing]);

  // Get color for each array cell based on current action
  const getCellColor = (index) => {
    if (step.action === "found" && step.foundIndex === index)
      return "bg-emerald-500 text-white";
    if (step.comparing && step.comparing.includes(index))
      return "bg-rose-500 text-white";
    if (step.action === "not-found") return "bg-slate-500 text-slate-200";
    return "bg-slate-600 text-slate-100";
  };

  // Legend message
  const renderLegend = () => {
    switch (step.action) {
      case "compare":
        return (
          <div className="flex items-center space-x-2">
            <Search size={16} className="text-rose-400" />
            <span>
              Comparing element{" "}
              <span className="font-semibold text-rose-400">
                {step.comparing[0]}
              </span>{" "}
              with target
            </span>
          </div>
        );
      case "found":
        return (
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>
              Target found at index{" "}
              <span className="font-semibold text-emerald-400">
                {step.foundIndex}
              </span>
            </span>
          </div>
        );
      case "not-found":
        return (
          <div className="flex items-center space-x-2">
            <Info size={16} className="text-slate-300" />
            <span>Target not found in array</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-8 relative w-full max-w-3xl mx-auto shadow-xl space-y-6 ">
      {/* Array visualization */}
      <div
      ref={scrollRef}
      className="flex justify-start items-center space-x-3 relative  px-4  scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800 overflow-x-auto min-h-[150px] "
      style={{ scrollBehavior: "smooth", maxWidth: "100%" }}
    >
      {safeArray.map((value, index) => {
        const isComparing =
          step.comparing && step.comparing.includes(index);
        const isFound =
          step.action === "found" && step.foundIndex === index;

        return (
          <motion.div
            ref={(el) => (cellRefs.current[index] = el)}
            key={`cell-${index}-${value}`}
            className={`relative w-10 h-10 min-w-10 min-h-10 rounded-lg flex items-center justify-center font-semibold text-lg border border-slate-500 ${getCellColor(
              index
            )}`}
            layout
            transition={{ duration: 0.3 }}
          >
            {value}

            {/* Target element above the comparing cell */}
            {isComparing && (
              <motion.div
                key={`target-${index}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: -50 }}
                exit={{ opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 12,
                }}
                className="absolute h-10 w-10 text-white top-0 left-1/2 -translate-x-1/2 bg-indigo-500 rounded-lg flex items-center justify-center shadow-md"
              >
                {step.target ?? "?"}
              </motion.div>
            )}

            {/* Found checkmark */}
            {isFound && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="absolute -top-8 text-emerald-400"
              >
                <CheckCircle2 size={20} />
              </motion.div>
            )}

            {/* Index label */}
            <div className="absolute -bottom-5 text-xs text-slate-400">
              {index}
            </div>
          </motion.div>
        );
      })}
    </div>

      {/* Target value display */}
      <div className="flex justify-center items-center text-slate-200 space-x-2 text-base">
        <span className="text-slate-400">Target:</span>
        <motion.div
          key={step.target}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="px-3 py-1 bg-indigo-500 text-white rounded-lg font-semibold"
        >
          {step.target}
        </motion.div>
      </div>

      {/* Explanation panel (moved below to avoid overlap) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="p-4 bg-[#0f172a] text-[#e6eef6] rounded-lg text-sm shadow-xl space-y-3"
      >
        {renderLegend()}

        {step.explanation && (
          <div className="flex items-start space-x-2">
            <Info size={16} className="text-slate-300 mt-0.5" />
            <span className="text-xs italic text-slate-300">
              {step.explanation}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LinearSearchArrayVisualization;

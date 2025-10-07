import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Info } from "lucide-react";

const BinarySearchVisualization = ({ step = {} }) => {
  const safeArray = Array.isArray(step.array) ? step.array : [];
  const scrollRef = useRef(null);
  const cellRefs = useRef([]);
  const [targetX, setTargetX] = useState(0);

  const activeRange = step.comparing || [];
  const midIndex = step.current ?? null;

  // Update target position when midIndex changes
  useEffect(() => {
  if (midIndex !== null && cellRefs.current[midIndex] && scrollRef.current) {
    const scrollContainer = scrollRef.current;
    const midCell = cellRefs.current[midIndex];

    // X relative to wrapper (scroll + offset)
    const scrollLeft = scrollContainer.scrollLeft;
    const wrapperLeft = scrollContainer.getBoundingClientRect().left;
    const midLeft = midCell.getBoundingClientRect().left;
    setTargetX(midLeft - wrapperLeft);

    // Scroll horizontally to center mid cell
    scrollContainer.scrollTo({
      left: midCell.offsetLeft - scrollContainer.offsetWidth / 2 + midCell.offsetWidth / 2,
      behavior: "smooth",
    });
  }
}, [midIndex]);


  const getCellColor = (index) => {
    if (step.action === "found" && index === midIndex)
      return "bg-emerald-500 text-white";
    if (index === midIndex) return "bg-rose-500 text-white"; // mid
    if (
      activeRange.length === 2 &&
      index >= activeRange[0] &&
      index <= activeRange[1]
    )
      return "bg-indigo-500 text-white"; // active range
    return "bg-slate-600 text-white"; // inactive
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto p-6 bg-[#1e293b] rounded-xl shadow-xl space-y-6">
      {/* Array container */}
     <div className="relative w-full max-w-4xl mx-auto p-6 bg-[#1e293b] rounded-xl shadow-xl space-y-6">
  {/* Scrollable array container */}
  <div
    ref={scrollRef}
    className="flex relative space-x-3 overflow-x-auto overflow-y-hidden min-h-[100px] px-2 py-4"
  >
    {safeArray.map((value, index) => (

      <div
        ref={(el) => (cellRefs.current[index] = el)}
        key={index}
        className={`relative w-10 h-10 min-w-10 min-h-10 flex items-center justify-center rounded-lg font-semibold text-lg border border-slate-500 ${getCellColor(index)}`}
      >
         {step.action === "found" && index === midIndex && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="absolute -top-8 text-emerald-400"
              >
                <CheckCircle2 size={20} />
              </motion.div>
            )}
           
        {value}
        <div className="absolute -bottom-5 text-xs text-slate-300">{index}</div>
      </div>
      
    ))}

    
  </div>

  {/* Target div outside scroll container */}
  {midIndex !== null && (
    <motion.div
      key={`target-${midIndex}`}
      initial={{ opacity: 0, y: 0 }}
      animate={{ x: targetX, y: -50, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 12 }}
      className="absolute top-10 h-10 w-10 bg-indigo-500 text-white rounded-lg flex items-center justify-center shadow-md font-semibold"
    >
      {step.target ?? "?"}
    </motion.div>
  )}

 
        
</div>


      {/* Explanation panel */}
      <div className="mt-6 p-4 bg-[#0f172a] text-[#e6eef6] rounded-lg shadow space-y-2 text-sm">
        {step.explanation && (
          <div className="flex items-start space-x-2">
            <Info size={16} className="text-slate-300 mt-0.5" />
            <span className="text-xs italic text-slate-300">
              {step.explanation}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BinarySearchVisualization;

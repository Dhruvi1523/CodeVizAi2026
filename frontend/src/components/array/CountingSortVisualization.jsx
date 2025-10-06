import React, { useEffect, useRef } from "react";
import { Info } from "lucide-react";

const highlightStyle =
  "border-4 border-blue-500 bg-blue-100 text-blue-900 font-bold scale-105 transition-transform duration-200";

const CountingSortVisualization = ({ step }) => {
  const arrayContainerRef = useRef(null);
  const countContainerRef = useRef(null);
  const outputContainerRef = useRef(null);

  if (!step) return null;

  const {
    array = [],
    count = [],
    output = [],
    currentIndex,
    countIndex,
    outputIndex,
    phase,
    currentValue,
  } = step;

  const min = Math.min(...array);
  const max = Math.max(...array);

  // Auto-scroll highlighted element into view horizontally
 useEffect(() => {
    const scrollToCenter = (ref, index) => {
      if (ref.current && index != null) {
        const container = ref.current;
        const box = container.querySelectorAll(".value-box")[index];
        if (box) {
          const boxCenter =
            box.offsetLeft - container.clientWidth / 2 + box.clientWidth / 2;
          container.scrollTo({
            left: boxCenter,
            behavior: "smooth",
          });
        }
      }
    };

    if (phase === "counting") scrollToCenter(arrayContainerRef, currentIndex);
    if (phase === "cumulative") scrollToCenter(countContainerRef, countIndex);
    if (phase === "output") scrollToCenter(outputContainerRef, outputIndex);
  }, [phase, currentIndex, countIndex, outputIndex]);


  // Explanation panel
  const getExplanation = () => {
  switch (phase) {
    case "counting":
      return (
        <>
          <p>
            Input array min = <b>{min}</b>, max = <b>{max}</b>.
          </p>
          <p>
            Counting current value <b>{currentValue}</b> → incrementing{" "}
            <b>count[{currentValue} - {min}]</b> = countIndex {countIndex}.
          </p>
        </>
      );
    case "cumulative":
      return (
        <>
          <p>Building cumulative count array.</p>
          <p>
            count[{countIndex}] = count[{countIndex - 1}] + count[{countIndex}]
            = {count[countIndex]}
          </p>
        </>
      );
    case "output":
      return (
        <>
          <p>
            Placing value <b>{currentValue}</b> into the output array.
          </p>
          <p>
            According to counting sort logic, value <b>{currentValue}</b> goes
            to position <b>{outputIndex}</b> in the output array.
          </p>
          <p>
            This is derived from count[<b>{currentValue} - {min}</b>] =
            {countIndex}.
          </p>
          <p>
            After placing, count[<b>{currentValue} - {min}</b>] is decremented by 1.
          </p>
        </>
      );
    case "done":
      return <p>All elements placed. Array is now sorted! 🎉</p>;
    default:
      return <p>Starting Counting Sort...</p>;
  }
};


  const getPhaseName = () => {
    switch (phase) {
      case "counting":
        return "Counting Occurrences";
      case "cumulative":
        return "Building Cumulative Count";
      case "output":
        return "Filling Output Array";
      case "done":
        return "Completed";
      default:
        return "Initializing";
    }
  };

  // Render array/count/output row
  const renderRow = (arr, highlightIdx, label, color, ref, activeRow = false) => (
    <div className={`overflow-auto flex flex-col mb-1 p-1 rounded transition-all duration-200 ${activeRow ? "bg-[#1f2a3a] scale-[1.02]" : ""}`}>
      <span className="text-xs text-gray-300 mb-0.5">{label}</span>
      <div ref={ref} className="flex overflow-x-auto space-x-1 min-w-max scrollbar-thin scrollbar-thumb-[#475569] scrollbar-track-[#1e293b]">
        {arr.map((val, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div
              className={`value-box w-6 h-6 flex items-center justify-center rounded border border-gray-600 text-[10px] font-medium text-gray-100 bg-[#1e293b] ${
                highlightIdx === idx ? highlightStyle : ""
              }`}
              style={{ backgroundColor: highlightIdx === idx ? color : "#1e293b" }}
            >
              {val}
            </div>
            <span className="text-[8px] text-gray-400 mt-0.5 font-mono">
              {idx}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center p-4 bg-[#0f172a] text-white">
      {/* Visualization */}
      <div className="w-full max-w-7xl flex-1 flex flex-col justify-around bg-[#1e293b] border border-[#334155] rounded-xl p-4 shadow-lg">
        {renderRow(
            array,
            phase === "counting" ? currentIndex : null,
            "Input Array",
            "#6366f1",
            arrayContainerRef
          )}
          {renderRow(
            count,
            phase === "counting" || phase === "cumulative" ? countIndex : null,
            "Count Array",
            "#10b981",
            countContainerRef
          )}
          {renderRow(
            output,
            phase === "output" ? outputIndex : null,
            "Output Array",
            "#f59e0b",
            outputContainerRef
          )}
      </div>

      {/* Explanation + Phase */}
      <div className="mt-4 w-full max-w-5xl bg-[#1e293b] border border-[#334155] rounded-xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="bg-[#334155] p-2 rounded-lg">
            <Info size={22} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#f1f5f9] mb-1">Step Explanation</h3>
            <div className="text-sm text-gray-300 leading-relaxed max-w-2xl">{getExplanation()}</div>
          </div>
        </div>
        <div className="bg-[#0f172a] border border-[#475569] rounded-lg px-4 py-2 text-sm font-medium text-gray-300 self-center sm:self-auto shadow-sm">
          <span className="text-[#6366f1] font-semibold">Phase:</span> {getPhaseName()}
        </div>
      </div>
    </div>
  );
};

export default CountingSortVisualization;

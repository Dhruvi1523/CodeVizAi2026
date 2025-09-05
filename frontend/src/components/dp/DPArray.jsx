import React from 'react';

export default function DPArray({ steps, highlightedIndex }) {
  return (
    <div className="flex flex-wrap gap-2 p-2">
      {steps.map((value, index) => {
        const isHighlighted = index === highlightedIndex;
        return (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-14 h-14 border border-[#334155] flex items-center justify-center rounded font-semibold transition-colors duration-300 ${isHighlighted ? 'bg-[#f59e0b] text-[#0f172a]' : 'bg-[#1e293b] text-[#f1f5f9]'}`}>
              {value === Infinity ? '∞' : value}
            </div>
            <div className="text-xs text-[#94a3b8] mt-1">{index}</div>
          </div>
        );
      })}
    </div>
  );
}
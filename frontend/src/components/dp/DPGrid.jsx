import React from 'react';

export default function DPGrid({ steps, n, m, highlightedCell, rowLabels = [], colLabels = [] }) {
  const grid = Array(n + 1).fill(null).map(() => Array(m + 1).fill(0));

  steps.forEach(step => {
    if (step.i >= 0 && step.i <= n && step.j >= 0 && step.j <= m) {
      grid[step.i][step.j] = step.value;
    }
  });

  return (
    <div className="overflow-auto max-h-[500px]">
      <table className="table-fixed border-collapse text-sm text-center w-full">
        <thead>
          <tr>
            {/* Top-left corner (empty) */}
            <th className="p-1 border border-[#334155] bg-[#334155] text-[#94a3b8] w-8"></th> 
            {/* Column labels */}
            {colLabels.map((label, index) => (
              <th key={`col-${index}`} className="p-1 border border-[#334155] bg-[#334155] text-[#94a3b8] w-8">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((row, rIdx) => (
            <tr key={`row-${rIdx}`}>
              {/* Row label */}
              <th className="p-1 border border-[#334155] bg-[#334155] text-[#94a3b8] w-8">
                {rowLabels[rIdx]}
              </th>
              {/* Grid cells */}
              {row.map((cellValue, cIdx) => (
                <td
                  key={`cell-${rIdx}-${cIdx}`}
                  className={`p-1 border border-[#334155] w-8 h-8 font-semibold
                    ${highlightedCell && highlightedCell.i === rIdx && highlightedCell.j === cIdx 
                        ? 'bg-[#f59e0b] text-[#0f172a]' 
                        : 'bg-[#1e293b] text-[#f1f5f9]'}
                    transition-colors duration-150
                  `}
                >
                  {cellValue}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
import React from 'react';

export default function DPGrid({ steps, n, m, highlightedCell, rowLabels, colLabels }) {
  // --- FIX IS HERE ---
  // Initialize the grid with 0 instead of '-'
  const grid = Array(n + 1).fill(null).map(() => Array(m + 1).fill(0));

  // Populate the grid with the actual computed values from the steps
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
            <th className="p-1 border border-gray-700 bg-gray-700 text-gray-300 w-8"></th> 
            {/* Column labels */}
            {colLabels.map((label, index) => (
              <th key={`col-${index}`} className="p-1 border border-gray-700 bg-gray-700 text-gray-300 w-8">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((row, rIdx) => (
            <tr key={`row-${rIdx}`}>
              {/* Row label */}
              <th className="p-1 border border-gray-700 bg-gray-700 text-gray-300 w-8">
                {rowLabels[rIdx]}
              </th>
              {/* Grid cells */}
              {row.map((cellValue, cIdx) => (
                <td
                  key={`cell-${rIdx}-${cIdx}`}
                  className={`p-1 border border-gray-700 w-8 h-8
                    ${highlightedCell && highlightedCell.i === rIdx && highlightedCell.j === cIdx 
                        ? 'bg-yellow-500 text-black font-bold' 
                        : 'bg-gray-900 text-white'}
                    transition-all duration-100
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
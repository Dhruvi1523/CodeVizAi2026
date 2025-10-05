import React from 'react';

const highlightStyle = 'border-4 border-blue-500 text-blue-900 font-bold bg-white';

const CountingSortVisualization = ({ step }) => {
  if (!step) return null;
  const {
    array = [],
    count = [],
    output = [],
    currentIndex,
    currentValue,
    countIndex,
    outputIndex,
    phase
  } = step;

  // Helper to render a row of boxes
  const renderRow = (arr, highlightIdx, label) => (
    <div className="flex flex-col items-center mb-2">
      <div className="flex space-x-2">
        {arr.map((value, idx) => (
          <div
            key={idx}
            className={`w-10 h-10 flex items-center justify-center rounded bg-white border border-gray-300 text-lg ${highlightIdx === idx ? highlightStyle : ''}`}
          >
            {value}
          </div>
        ))}
      </div>
      <div className="flex space-x-2 mt-1">
        {arr.map((_, idx) => (
          <span key={idx} className="text-xs text-gray-400 w-10 text-center">{idx}</span>
        ))}
      </div>
      {label && <div className="text-xs text-gray-500 mt-1">{label}</div>}
    </div>
  );

  return (
    <div className="flex flex-col items-center space-y-4 p-8">
      {renderRow(array, phase === 'counting' ? currentIndex : null, 'Input Array')}
      {renderRow(count, phase === 'counting' || phase === 'cumulative' ? countIndex : null, 'Count Array')}
      {renderRow(output, phase === 'output' ? outputIndex : null, 'Output Array')}
    </div>
  );
};

export default CountingSortVisualization;

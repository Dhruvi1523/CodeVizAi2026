import React from 'react';

// Helper to build tree nodes from array
function buildHeapTree(array) {
  if (!array || array.length === 0) return null;
  const nodes = array.map((value, index) => ({ value, index, left: null, right: null }));
  for (let i = 0; i < nodes.length; i++) {
    const leftIdx = 2 * i + 1;
    const rightIdx = 2 * i + 2;
    if (leftIdx < nodes.length) nodes[i].left = nodes[leftIdx];
    if (rightIdx < nodes.length) nodes[i].right = nodes[rightIdx];
  }
  return nodes[0];
}

function renderTree(node, highlightIndices = [], level = 0, pos = { x: 0, y: 0 }, parentPos = null, svgLines = []) {
  if (!node) return null;
  const isHighlighted = highlightIndices.includes(node.index);
  // Calculate position for SVG lines
  const nodeX = pos.x;
  const nodeY = pos.y;
  const nodeGap = 60 * Math.pow(0.7, level); // Decrease gap as level increases
  // Draw line from parent to this node
  if (parentPos) {
    svgLines.push(
      <line
        key={`line-${parentPos.x}-${parentPos.y}-${nodeX}-${nodeY}`}
        x1={parentPos.x}
        y1={parentPos.y}
        x2={nodeX}
        y2={nodeY}
        stroke="#888"
        strokeWidth={2}
      />
    );
  }
  // Render children and collect their SVG lines
  let left = null, right = null;
  if (node.left) {
    left = renderTree(node.left, highlightIndices, level + 1, { x: nodeX - nodeGap, y: nodeY + 60 }, { x: nodeX, y: nodeY }, svgLines);
  }
  if (node.right) {
    right = renderTree(node.right, highlightIndices, level + 1, { x: nodeX + nodeGap, y: nodeY + 60 }, { x: nodeX, y: nodeY }, svgLines);
  }
  // Render node
  return (
    <g key={`node-${node.index}`}> 
      <circle
        cx={nodeX}
        cy={nodeY}
        r={20}
        fill={isHighlighted ? '#facc15' : '#fff'}
        stroke={isHighlighted ? '#eab308' : '#888'}
        strokeWidth={isHighlighted ? 3 : 2}
      />
      <text
        x={nodeX}
        y={nodeY + 5}
        textAnchor="middle"
        fontWeight={isHighlighted ? 'bold' : 'normal'}
        fontSize={16}
        fill={isHighlighted ? '#000' : '#222'}
      >
        {node.value}
      </text>
      {left}
      {right}
    </g>
  );
}

const HeapSortVisualization = ({ step }) => {
  if (!step) return null;
  const highlight = [
    ...(step.comparing || []),
    ...(step.swapped || [])
  ];
  const tree = buildHeapTree(step.array);

  return (
    <div className="flex flex-col items-center space-y-8 p-8">
      <div className="mb-4">
        <div className="flex space-x-2 mb-2">
          {step.array.map((value, idx) => (
            <div
              key={idx}
              className={`px-3 py-2 rounded text-sm font-medium border-2 ${highlight.includes(idx) ? 'bg-yellow-300 border-yellow-600 text-black font-bold' : 'bg-blue-100 border-blue-400 text-blue-900'}`}
            >
              {value}
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          {step.array.map((_, idx) => (
            <span key={idx} className="text-xs text-gray-400 w-8 text-center">{idx}</span>
          ))}
        </div>
      </div>
      <div className="overflow-auto w-full flex justify-center">
        <svg width="700" height="300" style={{ overflow: 'visible' }}>
          {/* Render lines first */}
          {(() => {
            const svgLines = [];
            renderTree(tree, highlight, 0, { x: 350, y: 30 }, null, svgLines);
            return svgLines;
          })()}
          {/* Render nodes */}
          {renderTree(tree, highlight, 0, { x: 350, y: 30 })}
        </svg>
      </div>
    </div>
  );
};

export default HeapSortVisualization;

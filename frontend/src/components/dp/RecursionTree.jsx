import Tree from "react-d3-tree";

const renderRectSvgNode = ({ nodeDatum, toggleNode }, activeNodeId) => {
  const isActive = nodeDatum.id === activeNodeId;
  return (
    <g>
      <circle
        r={15}
        fill={nodeDatum.children ? "#3b82f6" : "#22c55e"}
        stroke={isActive ? "#facc15" : "#ffffff"}
        strokeWidth={isActive ? 4 : 2}
        onClick={toggleNode}
      />
      <text fill="#ffffff" strokeWidth={0} dy=".31em" x={20} style={{ fontWeight: "bold" }}>
        {nodeDatum.name}
      </text>
    </g>
  );
};

export default function RecursionTree({ data, activeNodeId }) {
  if (!data || data.length === 0) {
    return <p className="text-gray-400">No recursion tree data.</p>;
  }

  return (
    <div style={{ width: "100%", height: "500px" }} className="bg-gray-900 rounded-lg p-2">
      <Tree
        data={data}
        translate={{ x: 400, y: 50 }}
        orientation="vertical"
        separation={{ siblings: 1.5, nonSiblings: 2 }}
        collapsible={true}
        renderCustomNodeElement={(rd3tProps) => renderRectSvgNode(rd3tProps, activeNodeId)}
      />
    </div>
  );
}
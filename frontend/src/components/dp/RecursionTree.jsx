import Tree from "react-d3-tree";

const renderRectSvgNode = ({ nodeDatum, toggleNode }, activeNodeId) => {
  const isActive = nodeDatum.id === activeNodeId;
  return (
    <g>
      <circle
        r={15}
        // Internal nodes use the primary color, leaf nodes use the accent color
        fill={nodeDatum.children ? "#6366f1" : "#14b8a6"}
        // Active node has a warning color stroke, default is the foreground color
        stroke={isActive ? "#f59e0b" : "#f1f5f9"}
        strokeWidth={isActive ? 4 : 2}
        onClick={toggleNode}
      />
      <text
        // Text uses the foreground color
        fill="#f1f5f9"
        strokeWidth={0}
        dy=".31em"
        x={20}
        style={{ fontWeight: "bold" }}
      >
        {nodeDatum.name}
      </text>
    </g>
  );
};

export default function RecursionTree({ data, activeNodeId }) {
  if (!data || !data.length || data[0] === null) {
    // Placeholder text uses the muted foreground color
    return <p className="text-[#94a3b8]">No recursion tree data.</p>;
  }

  return (
    // Container uses the main background color
    <div style={{ width: "100%", height: "500px" }} className="bg-[#0f172a] rounded-lg p-2">
      <Tree
        data={data}
        translate={{ x: 400, y: 50 }}
        orientation="vertical"
        separation={{ siblings: 2.5,nonSiblings: 2 }}
        collapsible={true}
        renderCustomNodeElement={(rd3tProps) => renderRectSvgNode(rd3tProps, activeNodeId)}
        pathProps={{
            stroke: '#334155', // Corresponds to --border color
            strokeWidth: 2,
        }}
      />
    </div>
  );
}
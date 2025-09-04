// src/pages/dsa/VisualNode.jsx
export default function VisualNode({ node, speed, mode }) {
  const { value, status } = node;

  const base =
    "rounded p-3 min-w-[60px] min-h-[40px] border border-slate-700 flex items-center justify-center text-sm font-medium";

  const enterStyle = {
    transform: mode === "stack" ? "translateY(-20px) scale(0.98)" : "translateY(20px) scale(0.98)",
    opacity: 0,
  };

  const leaveStyle = { opacity: 0, transform: "scale(0.9) translateY(8px)" };
  const idleStyle = { opacity: 1, transform: "none" };

  const style = {
    transition: `all ${speed}ms ease`,
    ...(status === "enter" ? enterStyle : status === "leave" ? leaveStyle : idleStyle),
  };

  return (
    <div style={style} className={`${base} bg-slate-700`}>
      <div className="truncate px-1">{value}</div>
    </div>
  );
}

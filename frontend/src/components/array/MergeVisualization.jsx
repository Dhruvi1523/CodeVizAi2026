/* -------------------------  
   MergeVisualization.jsx
   ------------------------- */
import React, { useMemo, useRef, useState, useEffect } from "react";
import Tree from "react-d3-tree";
import { motion, AnimatePresence } from "framer-motion";

/* ---------------------------
   Small, styled box for values
   --------------------------- */
const ArrayBox = ({ value, color = "bg-indigo-500", highlight = false, isFaded = false }) => (
  <motion.div
    layout
    className={`flex items-center justify-center rounded-md font-semibold text-sm text-white p-2 min-w-[36px] shadow ${color} ${highlight ? "ring-4 ring-yellow-400" : ""} ${isFaded ? "opacity-30" : "opacity-100"}`}
    initial={{ opacity: 0, scale: 0.6 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.6, y: -15 }}
    transition={{ type: "spring", stiffness: 300, damping: 24 }}
  >
    {value}
  </motion.div>
);

/* -------------------------
   Custom Node
   ------------------------- */
const CustomNode = ({ nodeDatum, currentStep, mergedKeys }) => {
  const { array = [], depth = 0, range = [-1, -1] } = nodeDatum.attributes || {};
  const key = `${range[0]}-${range[1]}`;
  const isMerged = mergedKeys.has(key);

  const isActive =
    currentStep &&
    currentStep.range &&
    currentStep.depth === depth &&
    currentStep.range[0] === range[0] &&
    currentStep.range[1] === range[1];

  const isCompare = isActive && currentStep.action === "compare";
  const isMerging = isActive && currentStep.action === "merge-step";
  const isComplete = isActive && currentStep.action === "merge-complete";

  const leftHighlightIndex = (isCompare || isMerging) && currentStep.left ? currentStep.left.index : -1;
  const rightHighlightIndex = (isCompare || isMerging) && currentStep.right ? currentStep.right.index : -1;

  const displayArr = isMerging
    ? currentStep.merged
    : isComplete
    ? currentStep.array
    : !isCompare
    ? array
    : [];

  const boxWidth = Math.max(60, displayArr.length * 46 + 20);

  return (
    <foreignObject width={boxWidth} height={220} x={-(boxWidth / 2)} y={-100} style={{ overflow: "visible" }}>
      <div className="flex flex-col items-center pointer-events-auto">
        {/* Parent Array */}
        <AnimatePresence>
          {displayArr.length > 0 && (
            <motion.div
              key="parent-array"
              className={`rounded-md px-2 py-2 flex gap-2 items-center ${isActive ? "bg-[#1e2939] border border-slate-600" : "bg-[#1e2939]/40"}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              {displayArr.map((val, i) => {
                const highlight = !!displayArr && i === displayArr.length - 1 && (isMerging || isCompare);
                const justPlaced = isMerging && i === displayArr.length - 1;
                return (
                  <motion.div
                    key={`${val}-${i}-${displayArr.length}`}
                    initial={justPlaced ? { opacity: 0, y: 40 } : { opacity: 0, y: -8, scale: 0.6 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  >
                    <ArrayBox value={val} color={isComplete ? "bg-emerald-500" : "bg-indigo-500"} highlight={highlight} />
                    {justPlaced && (
                      <motion.div
                        className="text-yellow-400 text-xs font-bold text-center mt-1"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        ↑
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Child Arrays */}
        <AnimatePresence>
          {(isCompare || isMerging) && !isMerged && (
            <motion.div
              key="child-arrays"
              className="flex gap-4 mt-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
            >
              {/* Left array */}
              <div className="flex items-center gap-2 bg-[#1e2939] p-2 rounded-md">
                {(currentStep.left?.array || []).map((val, idx) => (
                  <ArrayBox key={`L-${val}-${idx}`} value={val} color="bg-teal-500" highlight={idx === leftHighlightIndex} isFaded={idx < leftHighlightIndex} />
                ))}
              </div>

              {/* Right array */}
              <div className="flex items-center gap-2 bg-[#1e2939] p-2 rounded-md">
                {(currentStep.right?.array || []).map((val, idx) => (
                  <ArrayBox key={`R-${val}-${idx}`} value={val} color="bg-purple-500" highlight={idx === rightHighlightIndex} isFaded={idx < rightHighlightIndex} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </foreignObject>
  );
};

/* -------------------------
   Helpers
   ------------------------- */
const nodeKey = (node) => {
  const r = node.attributes?.range || [0, 0];
  return `${r[0]}-${r[1]}`;
};

const buildFullTreeFromSteps = (steps, initialArray) => {
  const root = {
    name: (initialArray || []).join(","),
    attributes: { array: initialArray || [], range: [0, (initialArray || []).length - 1], depth: 0 },
    children: [],
  };

  const nodeMap = new Map([[nodeKey(root), root]]);

  for (const step of steps) {
    if (!step || !step.range || step.action !== "split") continue;
    const parentKey = `${step.range[0]}-${step.range[1]}`;
    const parent = nodeMap.get(parentKey);
    if (!parent) continue;

    const mid = step.range[0] + (step.left?.length || 0);
    const leftNode = {
      name: (step.left || []).join(","),
      attributes: { array: step.left || [], range: [step.range[0], mid - 1], depth: step.depth + 1 },
      children: [],
    };
    const rightNode = {
      name: (step.right || []).join(","),
      attributes: { array: step.right || [], range: [mid, step.range[1]], depth: step.depth + 1 },
      children: [],
    };

    parent.children = [leftNode, rightNode];
    nodeMap.set(nodeKey(leftNode), leftNode);
    nodeMap.set(nodeKey(rightNode), rightNode);
  }

  return root;
};

const bfsOrderKeys = (root) => {
  if (!root) return [];
  const q = [root];
  const out = [];
  while (q.length) {
    const n = q.shift();
    out.push(nodeKey(n));
    (n.children || []).forEach((c) => q.push(c));
  }
  return out;
};

const pruneTreeByKeys = (node, visibleKeys, mergedKeys) => {
  if (!node) return null;
  const key = nodeKey(node);
  if (!visibleKeys.has(key)) return null;

  const children = mergedKeys.has(key)
    ? []
    : (node.children || []).map((c) => pruneTreeByKeys(c, visibleKeys, mergedKeys)).filter(Boolean);

  return { ...node, children };
};

/* -------------------------
   Main visualization component
   ------------------------- */
export default function MergeVisualization({ steps = [], currentStepIndex, onStepChange, autoPlay = true, buildInterval = 250, stepInterval = 300 }) {
  const containerRef = useRef(null);
  const initialArray = useMemo(() => steps?.[0]?.array ?? steps?.find(s => s.action === "split")?.array ?? [], [steps]);
  const fullTree = useMemo(() => buildFullTreeFromSteps(steps, initialArray), [steps, initialArray]);
  const bfsKeys = useMemo(() => bfsOrderKeys(fullTree), [fullTree]);

  const controlled = typeof currentStepIndex === "number";
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = controlled ? currentStepIndex : internalIndex;
  const currentStep = steps?.[activeIndex] ?? null;

  const [revealCount, setRevealCount] = useState(1);
  const visibleKeys = useMemo(() => new Set(bfsKeys.slice(0, revealCount)), [bfsKeys, revealCount]);

  const [mergedKeys, setMergedKeys] = useState(new Set());
  useEffect(() => {
    if (currentStep?.action === "merge-complete" && currentStep.range) {
      setMergedKeys(prev => new Set([...prev, `${currentStep.range[0]}-${currentStep.range[1]}`]));
    }
  }, [currentStep]);

  const prunedTree = useMemo(() => pruneTreeByKeys(fullTree, visibleKeys, mergedKeys) || null, [fullTree, visibleKeys, mergedKeys]);

  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.8);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
      setTranslate({ x: rect.width / 2, y: 80 });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Auto-play build and step animation
  useEffect(() => {
    if (!autoPlay || controlled) return;
    let t;
    if (revealCount < bfsKeys.length) t = setTimeout(() => setRevealCount(r => Math.min(bfsKeys.length, r + 1)), buildInterval);
    else if (internalIndex < (steps?.length ?? 0) - 1) t = setTimeout(() => setInternalIndex(i => Math.min((steps?.length ?? 0) - 1, i + 1)), stepInterval);
    return () => clearTimeout(t);
  }, [revealCount, bfsKeys.length, internalIndex, autoPlay, controlled, steps?.length, buildInterval, stepInterval]);

  useEffect(() => {
    if (!controlled && typeof onStepChange === "function") onStepChange(internalIndex);
  }, [internalIndex, controlled, onStepChange]);

  useEffect(() => {
    if (!currentStep || !currentStep.range || !prunedTree) return;

    const key = `${currentStep.range[0]}-${currentStep.range[1]}`;
    
    // Helper to find the active node in the currently rendered tree
    const findNodeInTree = (node) => {
      if (nodeKey(node) === key) return node;
      for (let child of node.children || []) {
        const found = findNodeInTree(child);
        if (found) return found;
      }
      return null;
    };

    const activeNode = findNodeInTree(prunedTree);

    // Ensure the node exists and react-d3-tree has calculated its position
    if (activeNode && activeNode.__rd3t) {
      const { x, y } = activeNode.__rd3t;
      const depth = activeNode.attributes?.depth || 0;

      // Calculate a suitable zoom level based on depth (deeper nodes = more zoom)
      const targetZoom = Math.max(0.4, 1 - depth * 0.15);
      
      // Calculate the translation to center the node
      const targetTranslate = {
        x: containerSize.width / 2 - x * targetZoom,
        y: 100 - y * targetZoom
      };
      
      setZoom(targetZoom);
      setTranslate(targetTranslate);
    }
  }, [currentStep, prunedTree, containerSize]);

  useEffect(() => {
    if (!currentStep || !currentStep.range || bfsKeys.length === 0) return;
    const key = `${currentStep.range[0]}-${currentStep.range[1]}`;
    const idx = bfsKeys.indexOf(key);
    if (idx >= 0 && revealCount <= idx) setRevealCount(idx + 1);
  }, [activeIndex, currentStep, bfsKeys, revealCount]);

  if (!fullTree) return <div className="bg-[#0f172a] rounded-lg h-96 flex items-center justify-center"><p className="text-slate-400">Preparing visualization...</p></div>;

  return (
    <div ref={containerRef} className="bg-[#1e2939] rounded-xl p-4 min-h-[75vh] h-full w-full overflow-auto">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="text-slate-300 text-sm">Build: {Math.min(revealCount, bfsKeys.length)}/{bfsKeys.length}</div>
        <div className="text-slate-300 text-sm">Step: {activeIndex}/{(steps?.length ?? 0) - 1}</div>
      </div>
      <div style={{ width: "100%", height: "calc(100vh - 160px)" }}>
      <Tree
          data={prunedTree || fullTree}
          translate={translate}
          zoom={zoom} // Use the zoom state
          orientation="vertical"
          renderCustomNodeElement={props => (
            <CustomNode {...props} currentStep={currentStep} mergedKeys={mergedKeys} />
          )}
          separation={{ siblings: 2.5, nonSiblings: 2 }}
          pathFunc="diagonal"
          transitionDuration={700} // This animates the pan and zoom
          styles={{
            links: { stroke: "#334155", strokeWidth: 2 },
          }}
        />
      </div>
    </div>
  );
}

import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Tree from "react-d3-tree";
import {
  deepCopy,
  toConvert,
  getNodeName,
  createNode,
  findAndMarkDeleting,
  getAlgorithmSteps,
} from "../../utils/treeHelpers";

// BST-Specific Logic
const insertBST = (node, value) => {
  if (!node) return createNode(value, "Binary Search Tree");
  if (value < node.value) node.left = insertBST(node.left, value);
  else if (value > node.value) node.right = insertBST(node.right, value);
  return node;
};

const deleteBST = (node, value) => {
  if (!node) return node;
  if (value < node.value) node.left = deleteBST(node.left, value);
  else if (value > node.value) node.right = deleteBST(node.right, value);
  else {
    if (!node.left) return node.right;
    if (!node.right) return node.left;
    const temp = minValueNode(node.right);
    node.value = temp.value;
    node.right = deleteBST(node.right, temp.value);
  }
  return node;
};

const minValueNode = (node) => {
  let current = node;
  while (current.left) current = current.left;
  return current;
};

const simulateOperation = (variables, operation, params, treeType) => {
  let tree = deepCopy(variables.tree || { root: null }); // Deep copy to avoid mutating
  let root = tree.root;
  let states = [];

  if (!root && operation !== "insert") return [];

  if (operation === "insert") {
    let newRoot = insertBST(root, params.value);
    if (newRoot) root = newRoot;
    states.push(toConvert(root, treeType, getNodeName));
  } else if (operation === "delete") {
    let tempRoot = findAndMarkDeleting(deepCopy(root), params.value, treeType);
    if (tempRoot) {
      states.push(toConvert(tempRoot, treeType, getNodeName));
    }
    let newRoot = deleteBST(root, params.value);
    if (newRoot) root = newRoot;
    states.push(toConvert(root, treeType, getNodeName));
  }

  tree.root = root;
  variables.tree = tree;
  return states;
};

function BinarySearchTree() {
  const treeType = "Binary Search Tree";
  const [treeData, setTreeData] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [algorithmSteps, setAlgorithmSteps] = useState([]);
  const [variables, setVariables] = useState({ tree: { root: null } });

  const stepsEndRef = useRef(null);
  const treeContainerRef = useRef(null); // Ref for dynamic sizing

  // Auto-scroll for algorithm steps
  useEffect(() => {
    if (stepsEndRef.current) {
      stepsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [algorithmSteps]);

  // Reset tree on mount
  useEffect(() => {
    setVariables({ tree: { root: null } });
    setTreeData(null);
    setAlgorithmSteps([]);
    setInputValue("");
  }, []);

  // Calculate dynamic translate based on container size
  const getTranslate = () => {
    if (treeContainerRef.current) {
      const { width, height } = treeContainerRef.current.getBoundingClientRect();
      return { x: width / 2, y: height / 6 }; // Center horizontally, shift up vertically
    }
    return { x: 240, y: 60 }; // Fallback
  };

  const animateTree = async (operation, value) => {
    if (isAnimating || !value) return; // Prevent animation if already animating or no value
    setIsAnimating(true);
    setAlgorithmSteps([]);

    let newVariables = deepCopy(variables); // Deep copy variables
    let states = [];
    let steps = [];

    if (operation === "display") {
      if (newVariables.tree?.root) {
        states.push(toConvert(newVariables.tree.root, treeType, getNodeName));
        steps.push("Displaying current tree structure");
      }
    } else if (operation === "insert" && inputValue) {
      const parsedValue = parseInt(value, 10);
      if (isNaN(parsedValue)) {
        setAlgorithmSteps(["Invalid input: Please enter a valid number"]);
        setIsAnimating(false);
        return;
      }
      steps.push(`Inserting value: ${parsedValue}`);
      states = simulateOperation(newVariables, "insert", { value: parsedValue }, treeType);
      steps = steps.concat(getAlgorithmSteps("insert", parsedValue, treeType));
    } else if (operation === "delete" && inputValue) {
      const parsedValue = parseInt(value, 10);
      if (isNaN(parsedValue)) {
        setAlgorithmSteps(["Invalid input: Please enter a valid number"]);
        setIsAnimating(false);
        return;
      }
      steps.push(`Deleting value: ${parsedValue}`);
      states = simulateOperation(newVariables, "delete", { value: parsedValue }, treeType);
      steps = steps.concat(getAlgorithmSteps("delete", parsedValue, treeType));
    }

    if (states.length === 0 && newVariables.tree?.root) {
      states.push(toConvert(newVariables.tree.root, treeType, getNodeName));
    }

    setAlgorithmSteps(steps);
    setVariables(newVariables);

    // Animate through states
    for (let i = 0; i < states.length; i++) {
      // Reset isAnimating flags to prevent rendering artifacts
      const state = deepCopy(states[i]);
      const resetAnimating = (node) => {
        if (!node) return;
        node.isAnimating = false;
        if (node.children) {
          node.children.forEach(resetAnimating);
        }
      };
      resetAnimating(state);
      setTreeData(state);
      setAlgorithmSteps((prev) => [
        ...prev.slice(0, i),
        `Step ${i + 1}: ${steps[i] || "Updating tree"}`,
        ...prev.slice(i + 1),
      ]);
      await new Promise((r) => setTimeout(r, animationSpeed));
    }

    // Ensure final state is set
    if (states.length > 0) {
      setTreeData(states[states.length - 1]);
    }

    setIsAnimating(false);
  };

  return (
    <div>
      <header className="bg-gray-800 p-4 shadow-md mb-4 rounded-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Binary Search Tree Visualizer</h1>
          <p className="text-sm text-gray-400 mt-1">Trees where each node has at most two children, sorted by value.</p>
        </div>
        <Link
          to="/tree-dsa"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 disabled:opacity-60 transition"
        >
          Back to Landing
        </Link>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Panel (Controls + Algorithm Steps) */}
        <div className="flex flex-col gap-3 lg:col-span-1">
          {/* Controls */}
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value to insert/delete"
            className="p-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-green-400 outline-none"
          />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => animateTree("insert", inputValue)}
              disabled={isAnimating || !inputValue}
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-500 disabled:opacity-60 transition"
            >
              Insert Node
            </button>
            <button
              onClick={() => animateTree("delete", inputValue)}
              disabled={isAnimating || !inputValue}
              className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-500 disabled:opacity-60 transition"
            >
              Delete Node
            </button>
             <button
              onClick={() => {
                setVariables({ tree: { root: null } });
                setTreeData(null);
                setAlgorithmSteps([]);
                setInputValue("");
                setParentValue("");
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-500 transition"
            >
              Clear Tree
            </button>
          </div>
          {/* Animation Speed */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Animation Speed (ms):</label>
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(Number(e.target.value))}
              className="w-32 accent-green-500"
            />
            <span className="text-gray-300">{animationSpeed}ms</span>
          </div>
          {/* Algorithm Steps Panel */}
          <div className="bg-gray-800 p-4 rounded-xl shadow-lg h-[50vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2 text-green-400">Algorithm Steps</h2>
            {algorithmSteps.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-gray-200">
                {algorithmSteps.map((step, index) => (
                  <li key={index} className="mb-1">
                    {step}
                  </li>
                ))}
                <div ref={stepsEndRef} /> {/* Auto-scroll target */}
              </ul>
            ) : (
              <p className="text-gray-500">
                No steps to display. Perform an operation to see the algorithm steps.
              </p>
            )}
          </div>
        </div>
        {/* Tree Visualization */}
        <div
          className="bg-gray-800 p-4 rounded-xl shadow-lg h-[60vh] overflow-hidden lg:col-span-2"
          ref={treeContainerRef}
        >
          {treeData ? (
            <Tree
              data={treeData}
              orientation="vertical"
              translate={getTranslate()}
              renderCustomNodeElement={({ nodeDatum }) => (
                <g>
                  <circle
                    r={20}
                    fill={nodeDatum.isAnimating ? "#ffffff" : "#ffffff"}
                    stroke="#f7f1fa"
                    strokeWidth={2}
                  />
                  <text
                    fill={nodeDatum.isAnimating ? "#1f2937" : "#ffffff"}
                    fontSize="14"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {nodeDatum.name}
                  </text>
                </g>
              )}
              pathClassFunc={() => "stroke-green-500 stroke-2"}
              zoomable
              collapsible
              initialDepth={2}
              separation={{ siblings: 1, nonSiblings: 2 }} // Adjust node spacing
            />
          ) : (
            <p className="text-gray-500 h-full grid place-items-center text-center">
              Enter values and use buttons to visualize the tree.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BinarySearchTree;
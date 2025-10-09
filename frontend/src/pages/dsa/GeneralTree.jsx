
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


// Fixed insert logic (mutates tree correctly)
const insertGeneralTree = (node, value, parentValue, treeType) => {
  const val = Number(value);
  const parentVal = parentValue ? Number(parentValue) : null;

  // Case 1: Empty tree — create root
  if (!node && parentVal === null) {
    return createNode(val, treeType);
  }

  // Case 1.5: Parent not specified and root exists — attach to root
  if (parentVal === null && node) {
    node.children = node.children || [];
    node.children.push(createNode(val, treeType));
    return node;
  }

  // Case 2: Empty tree but parent specified — invalid
  if (!node && parentVal !== null) {
    return null; // Parent not found
  }

  // Case 3: Found parent — attach new child
  if (node.value === parentVal) {
    node.children = node.children || [];
    node.children.push(createNode(val, treeType));
    return node;
  }

  // Case 4: Recursively search for parent
  if (node.children && node.children.length > 0) {
    for (let i = 0; i < node.children.length; i++) {
      const result = insertGeneralTree(node.children[i], val, parentVal, treeType);
      if (result) {
        node.children[i] = result; // Update child if changed (though mutation handles it)
      }
    }
  }

  return node; // Always return the same root reference
};

const deleteGeneralTree = (node, value) => {
  if (!node) return null;
  if (node.value === Number(value)) return null; // remove node + subtree
  if (node.children) {
    node.children = node.children
      .map((child) => deleteGeneralTree(child, value))
      .filter(Boolean);
  }
  return node;
};

// Fixed simulateOperation to preserve tree state
const simulateOperation = (variables, operation, params, treeType) => {
  const tree = deepCopy(variables.tree || { root: null });
  let root = tree.root;
  const states = [];

  if (operation === "insert") {
    const val = Number(params.value);
    const parentVal = params.parentValue ? Number(params.parentValue) : null;

    if (!root && parentVal === null) {
      root = createNode(val, treeType); // create root
    } else {
      root = insertGeneralTree(root, val, parentVal, treeType); // mutate existing tree
    }

    states.push(toConvert(root, treeType, getNodeName));
  } else if (operation === "delete") {
    const val = Number(params.value);
    const tempRoot = findAndMarkDeleting(deepCopy(root), val, treeType);
    if (tempRoot) states.push(toConvert(tempRoot, treeType, getNodeName));
    root = deleteGeneralTree(root, val);
    if (root) states.push(toConvert(root, treeType, getNodeName));
  }

  tree.root = root;
  variables.tree = tree;
  return states;
};

function GeneralTree() {
  const treeType = "General Tree";
  const [treeData, setTreeData] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [parentValue, setParentValue] = useState("");
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [algorithmSteps, setAlgorithmSteps] = useState([]);
  const [variables, setVariables] = useState({ tree: { root: null } });

  const stepsEndRef = useRef(null);
  const treeContainerRef = useRef(null);

  // Auto-scroll for algorithm steps
  useEffect(() => {
    if (stepsEndRef.current) {
      stepsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [algorithmSteps]);

  const getTranslate = () => {
    if (treeContainerRef.current) {
      const { width, height } = treeContainerRef.current.getBoundingClientRect();
      return { x: width / 2, y: height / 6 };
    }
    return { x: 240, y: 60 };
  };

  const animateTree = async (operation, value, parentVal) => {
    if (isAnimating || !value) return;
    setIsAnimating(true);
    setAlgorithmSteps([]);

    const newVariables = deepCopy(variables);
    let steps = [];
    let states = [];

    if (operation === "insert") {
      const val = Number(value);
      const pVal = parentVal ? Number(parentVal) : null;

      if (isNaN(val)) {
        setAlgorithmSteps(["Invalid input: Please enter a valid number"]);
        setIsAnimating(false);
        return;
      }

      // Validate parent existence
      const findNode = (node, target) => {
        if (!node) return false;
        if (node.value === target) return true;
        return (node.children || []).some((child) => findNode(child, target));
      };

      if (pVal !== null && !findNode(newVariables.tree.root, pVal)) {
        setAlgorithmSteps([`Parent ${pVal} not found. Insert it first.`]);
        setIsAnimating(false);
        return;
      }

      steps.push(
        pVal
          ? `Inserting ${val} as child of ${pVal}`
          : `Inserting ${val} as root node`
      );

      states = simulateOperation(newVariables, "insert", { value: val, parentValue: pVal }, treeType);
      steps = steps.concat(getAlgorithmSteps("insert", val, treeType));
    } else if (operation === "delete") {
      const val = Number(value);
      if (isNaN(val)) {
        setAlgorithmSteps(["Invalid input: Please enter a valid number"]);
        setIsAnimating(false);
        return;
      }

      steps.push(`Deleting value ${val}`);
      states = simulateOperation(newVariables, "delete", { value: val }, treeType);
      steps = steps.concat(getAlgorithmSteps("delete", val, treeType));
    }

    setAlgorithmSteps(steps);
    setVariables(newVariables);

    // Animate step-by-step
    for (let i = 0; i < states.length; i++) {
      setTreeData(deepCopy(states[i]));
      await new Promise((r) => setTimeout(r, animationSpeed));
    }

    if (states.length > 0) {
      setTreeData(states[states.length - 1]);
    }

    setIsAnimating(false);
  };

  return (
    <div>
      <header className="bg-gray-800 p-4 shadow-md mb-4 rounded-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">General Tree Visualizer</h1>
          <p className="text-sm text-gray-400 mt-1">
            Trees where each node can have any number of children.
          </p>
        </div>
        <Link
          to="/tree-dsa"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 transition"
        >
          Back to Landing
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Panel */}
        <div className="flex flex-col gap-3 lg:col-span-1">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value to insert/delete"
            className="p-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-green-400 outline-none"
          />

          <input
            type="number"
            value={parentValue}
            onChange={(e) => setParentValue(e.target.value)}
            placeholder="Enter parent value (optional)"
            className="p-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-green-400 outline-none"
          />

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => animateTree("insert", inputValue, parentValue)}
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

          <div className="bg-gray-800 p-4 rounded-xl shadow-lg h-[50vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2 text-green-400">Algorithm Steps</h2>
            {algorithmSteps.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-gray-200">
                {algorithmSteps.map((step, index) => (
                  <li key={index} className="mb-1">{step}</li>
                ))}
                <div ref={stepsEndRef} />
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
              separation={{ siblings: 1, nonSiblings: 2 }}
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

export default GeneralTree;

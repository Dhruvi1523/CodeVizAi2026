import React, { useEffect, useState } from "react";
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

// --- Red-Black Tree Core Logic ---
const isRed = (node) => node && node.color === "RED";

const flipColorRB = (node) => {
  node.color = node.color === "RED" ? "BLACK" : "RED";
  if (node.left) node.left.color = node.left.color === "RED" ? "BLACK" : "RED";
  if (node.right) node.right.color = node.right.color === "RED" ? "BLACK" : "RED";
};

const rotateLeftRB = (h) => {
  const x = h.right;
  h.right = x.left;
  x.left = h;
  x.color = h.color;
  h.color = "RED";
  return x;
};

const rotateRightRB = (h) => {
  const x = h.left;
  h.left = x.right;
  x.right = h;
  x.color = h.color;
  h.color = "RED";
  return x;
};

const insertRB = (root, value) => {
  const insertHelper = (node) => {
    if (!node) {
      const newNode = createNode(value, "Red Black Tree");
      newNode.color = "RED"; // Default color for new nodes
      return newNode;
    }

    if (value < node.value) node.left = insertHelper(node.left);
    else if (value > node.value) node.right = insertHelper(node.right);
    // Ignore duplicates

    // Fix-up operations
    if (isRed(node.right) && !isRed(node.left)) node = rotateLeftRB(node);
    if (isRed(node.left) && isRed(node.left.left)) node = rotateRightRB(node);
    if (isRed(node.left) && isRed(node.right)) flipColorRB(node);

    return node;
  };

  root = insertHelper(root);
  if (root) root.color = "BLACK"; // Root is always black
  return root;
};

// --- Simplified delete (BST delete only) ---
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

const deleteRB = (root, value) => deleteBST(root, value);

const minValueNode = (node) => {
  let current = node;
  while (current.left) current = current.left;
  return current;
};

// --- Simulated Tree Operation (Insert/Delete) ---
const simulateOperation = (variables, operation, params, treeType) => {
  let tree = variables["tree"] || {};
  let root = tree.root;
  let states = [];

  if (!root && operation !== "insert") return [];

  if (operation === "insert") {
    let newRoot = insertRB(root, params.value);
    if (newRoot) root = newRoot;
  } else if (operation === "delete") {
    let tempRoot = findAndMarkDeleting(root, params.value, treeType);
    if (tempRoot) {
      states.push(toConvert(tempRoot, treeType, getNodeName));
      root = deepCopy(tempRoot);
    }
    let newRoot = deleteRB(root, params.value);
    if (newRoot) root = newRoot;
    states.push(toConvert(root, treeType, getNodeName));
  }

  tree.root = root;
  variables["tree"] = tree;
  if (states.length === 0 && root) states.push(toConvert(root, treeType, getNodeName));
  return states;
};

function RedBlackTree() {
  const treeType = "Red Black Tree";
  const [treeData, setTreeData] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [algorithmSteps, setAlgorithmSteps] = useState([]);
  const [variables, setVariables] = useState({ tree: { root: null } });

  useEffect(() => {
    setVariables({ tree: { root: null } });
    setTreeData(null);
    setAlgorithmSteps([]);
    setInputValue("");
  }, []);

  const animateTree = async (operation, value) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAlgorithmSteps([]);
    setTreeData(null);

    let newVariables = { ...variables };
    let states = [];
    let steps = [];

    if (operation === "display") {
      if (newVariables.tree?.root) {
        states.push(toConvert(newVariables.tree.root, treeType, getNodeName));
        steps.push("Displaying current tree structure");
      }
    } else if (operation === "insert" && inputValue) {
      steps.push(`Inserting value: ${value}`);
      states = simulateOperation(newVariables, "insert", { value: parseInt(value, 10) }, treeType);
      steps = steps.concat(getAlgorithmSteps("insert", value, treeType));
    } else if (operation === "delete" && inputValue) {
      steps.push(`Deleting value: ${value}`);
      states = simulateOperation(newVariables, "delete", { value: parseInt(value, 10) }, treeType);
      steps = steps.concat(getAlgorithmSteps("delete", value, treeType));
    }

    if (states.length === 0 && newVariables.tree?.root) {
      states.push(toConvert(newVariables.tree.root, treeType, getNodeName));
    }

    setAlgorithmSteps(steps);
    setVariables(newVariables);

    for (let i = 0; i < states.length; i++) {
      setTreeData({ ...states[i] });
      setAlgorithmSteps((prev) => [
        ...prev,
        `Step ${i + 1}: ${steps[i] || "Updating tree"}`,
      ]);
      await new Promise((r) => setTimeout(r, animationSpeed));
    }

    setIsAnimating(false);
  };

  // --- Custom Node (Fixed text visibility) ---
  const CustomNode = ({ nodeDatum }) => {
  // Default fill for node background
  let fill = "#ffffff";

  if (nodeDatum.attributes?.deleting) fill = "#808080";
  else if (nodeDatum.attributes?.color === "RED") fill = "#ff0000";
  else if (nodeDatum.attributes?.color === "BLACK") fill = "#1b1717ff";

  const text = nodeDatum.name || "";

  return (
    <g>
      {/* Node Circle */}
      <circle r={20} fill={fill}  strokeWidth={2} />

      {/* Force text color to white using both fill + style attributes */}
      <text
        x="0"
        y="0"
        fontSize={14}
        textAnchor="middle"
        alignmentBaseline="middle"
       
        style={{ fill: "#b9b3eeff", fontWeight: "bold", pointerEvents: "none" }}
      >
        {text}
      </text>
    </g>
  );
};

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4">
      <header className="bg-gray-800 p-4 shadow-md mb-4 rounded-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Red Black Tree Visualizer</h1>
          <p className="text-sm text-gray-400 mt-1">
            Self-balancing binary search tree using red and black colors to maintain balance.
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
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg lg:col-span-1">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value to insert/delete"
            className="p-2 rounded-lg border border-gray-700 bg-gray-900 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-green-400 outline-none w-full mb-3"
          />

          <div className="flex gap-2 mb-3">
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

          <div className="flex items-center gap-2 mb-6">
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

          <div className="bg-gray-900 p-4 rounded-lg h-48 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2 text-green-400">
              Algorithm Steps
            </h2>
            {algorithmSteps.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-gray-200">
                {algorithmSteps.map((step, index) => (
                  <li key={index} className="mb-1">
                    {step}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">
                No steps to display. Perform an operation to see the algorithm steps.
              </p>
            )}
          </div>
        </div>

        {/* Tree Visualization */}
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg h-[60vh] overflow-hidden lg:col-span-2">
          {treeData ? (
            <Tree
              data={treeData}
              orientation="vertical"
              translate={{ x: 240, y: 60 }}
              renderCustomNodeElement={(props) => <CustomNode {...props} />}
              pathClassFunc={() => "stroke-gray-400 stroke-2"}
              zoomable
              collapsible
              initialDepth={2}
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

export default RedBlackTree;

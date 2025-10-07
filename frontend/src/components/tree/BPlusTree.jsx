import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Tree from "react-d3-tree";
import { deepCopy, toConvert, getNodeName, createNode, findAndMarkDeleting, getAlgorithmSteps } from "../../utils/treeHelpers";

// B+Tree Specific Logic (order = 3)
const insertBPlusTree = (root, key, order = 3) => {
  if (!root) return { keys: [key], children: [], isLeaf: true };
  if (root.keys.length === order - 1) {
    const newRoot = { keys: [], children: [root], isLeaf: false };
    splitChildBPlus(newRoot, 0, order);
    root = newRoot;
  }
  insertNonFullBPlus(root, key, order);
  return root;
};

const insertNonFullBPlus = (node, key, order) => {
  if (node.isLeaf) {
    node.keys.push(key);
    node.keys.sort((a, b) => a - b);
    return;
  }
  let i = 0;
  while (i < node.keys.length && key > node.keys[i]) i++;
  let child = node.children[i];
  if (child.keys.length === order - 1) {
    splitChildBPlus(node, i, order);
    if (key > node.keys[i]) i++;
  }
  insertNonFullBPlus(node.children[i], key, order);
};

const splitChildBPlus = (parent, i, order) => {
  const child = parent.children[i];
  const mid = Math.floor((order - 1) / 2);
  let midKey;
  let leftKeys = child.keys.slice(0, mid);
  let rightKeys = child.keys.slice(mid);
  let leftChildren = child.children ? child.children.slice(0, mid + 1) : [];
  let rightChildren = child.children ? child.children.slice(mid + 1) : [];
  if (child.isLeaf) {
    midKey = rightKeys.shift(); // First of right becomes separator
    leftChildren = []; // Leaves have no children in B+ (simplified)
    rightChildren = [];
  } else {
    midKey = child.keys[mid];
    rightKeys = child.keys.slice(mid + 1);
    leftChildren = child.children.slice(0, mid + 1);
    rightChildren = child.children.slice(mid + 1);
  }
  const left = { keys: leftKeys, children: leftChildren, isLeaf: child.isLeaf };
  const right = { keys: rightKeys, children: rightChildren, isLeaf: child.isLeaf };
  parent.keys.splice(i, 0, midKey);
  parent.children.splice(i, 1, left, right);
};

const deleteBPlusTree = (root, key, order = 3) => {
  if (!root) return root;
  let i = 0;
  while (i < root.keys.length && key > root.keys[i]) i++;
  if (root.isLeaf) {
    if (i < root.keys.length && root.keys[i] === key) root.keys.splice(i, 1);
    return root;
  }
  if (i < root.keys.length && key === root.keys[i]) {
    root.children[i] = deleteBPlusTree(root.children[i], key, order);
  } else {
    root.children[i] = deleteBPlusTree(root.children[i], key, order);
  }
  const minKey = Math.ceil(order / 2) - 1;
  if (root.children[i].keys.length < minKey) {
    balanceChildBPlus(root, i, order);
  }
  if (root.keys.length === 0 && root.children.length === 1) root = root.children[0];
  return root;
};

const balanceChildBPlus = (parent, i, order) => {
  const minKey = Math.ceil(order / 2) - 1;
  const child = parent.children[i];
  if (i > 0 && parent.children[i - 1].keys.length > minKey) {
    const left = parent.children[i - 1];
    if (child.isLeaf) {
      const borrowKey = left.keys.pop();
      child.keys.unshift(borrowKey);
      parent.keys[i - 1] = borrowKey;
    } else {
      const borrowKey = left.keys.pop();
      child.keys.unshift(parent.keys[i - 1]);
      parent.keys[i - 1] = borrowKey;
      child.children.unshift(left.children.pop());
    }
  } else if (i < parent.children.length - 1 && parent.children[i + 1].keys.length > minKey) {
    const right = parent.children[i + 1];
    if (child.isLeaf) {
      const borrowKey = right.keys.shift();
      child.keys.push(borrowKey);
      parent.keys[i] = right.keys[0] || borrowKey;
    } else {
      const borrowKey = right.keys.shift();
      child.keys.push(parent.keys[i]);
      parent.keys[i] = borrowKey;
      child.children.push(right.children.shift());
    }
  } else {
    if (i > 0) {
      const left = parent.children[i - 1];
      if (child.isLeaf) {
        left.keys = left.keys.concat(child.keys);
      } else {
        left.keys.push(parent.keys[i - 1]);
        left.keys = left.keys.concat(child.keys);
        left.children = left.children.concat(child.children);
      }
      parent.children.splice(i, 1);
      parent.keys.splice(i - 1, 1);
    } else {
      const right = parent.children[i + 1];
      if (child.isLeaf) {
        child.keys = child.keys.concat(right.keys);
      } else {
        child.keys.push(parent.keys[i]);
        child.keys = child.keys.concat(right.keys);
        child.children = child.children.concat(right.children);
      }
      parent.children.splice(i + 1, 1);
      parent.keys.splice(i, 1);
    }
  }
};

const simulateOperation = (variables, operation, params, treeType) => {
  let tree = deepCopy(variables["tree"] || {});
  let root = tree.root;
  let states = [];

  if (!root && operation !== "insert") return [];

  const order = 3; // Fixed order

  if (operation === "insert") {
    let newRoot = insertBPlusTree(root, params.value, order);
    if (newRoot) root = newRoot;
  } else if (operation === "delete") {
    let tempRoot = findAndMarkDeleting(root, params.value, treeType);
    if (tempRoot) {
      states.push(toConvert(tempRoot, treeType, getNodeName));
      root = deepCopy(tempRoot);
    }
    let newRoot = deleteBPlusTree(root, params.value, order);
    if (newRoot) root = newRoot;
    states.push(toConvert(root, treeType, getNodeName));
  }

  tree.root = root;
  variables["tree"] = tree;
  if (states.length === 0 && root) states.push(toConvert(root, treeType, getNodeName));
  return states;
};

function BPlusTree() {
  const treeType = "B+Tree";
  const [treeData, setTreeData] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [algorithmSteps, setAlgorithmSteps] = useState([]);
  const [variables, setVariables] = useState({ tree: { root: null } });
  const treeContainerRef = useRef();

  useEffect(() => {
    setVariables({ tree: { root: null } });
    setTreeData(null);
    setAlgorithmSteps([]);
    setInputValue("");
  }, []);

  const animateTree = async (operation, value) => {
    if (!value) return alert("Please enter a value!");
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
    } else if (operation === "insert") {
      steps.push(`Inserting value: ${value}`);
      states = simulateOperation(newVariables, "insert", { value: parseInt(value, 10) }, treeType);
      steps = steps.concat(getAlgorithmSteps("insert", value, treeType));
    } else if (operation === "delete") {
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
      setAlgorithmSteps((prev) => [...prev.slice(0, i), `Step ${i + 1}: ${steps[i] || "Updating tree"}`, ...prev.slice(i + 1)]);
      await new Promise((r) => setTimeout(r, animationSpeed));
    }

    setIsAnimating(false);
  };

  const getDynamicTranslate = () => {
    if (treeContainerRef.current) {
      const { width, height } = treeContainerRef.current.getBoundingClientRect();
      return { x: width / 2, y: height / 6 };
    }
    return { x: 240, y: 60 };
  };

  const CustomNode = ({ nodeDatum }) => {
    let fill = "#4a90e2"; // Default blue for B+Tree nodes
    if (nodeDatum.attributes?.deleting) fill = "#808080"; // Gray for deleting nodes
    let text = nodeDatum.name;
    const width = Math.max(60, text.length * 8); // Dynamic width based on text
    const height = 30; // Fixed height

    return (
      <g>
        {/* Center the rectangle at the node's origin */}
        <rect
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          rx={15}
          fill={fill}
          stroke="#ffffff"
          strokeWidth={2}
        />
        {/* Center the text within the rectangle */}
        <text
          x={0}
          y={0}
          fontSize={12}
          textAnchor="middle"
          alignmentBaseline="middle"
          fill="#ffffff"
          style={{ fontWeight: "bold" }}
        >
          {text}
        </text>
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4">
      {/* Header */}
      <header className="bg-gray-800 p-4 shadow-md mb-4 rounded-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">B+Tree Visualizer</h1>
          <p className="text-sm text-gray-400 mt-1">Variant of B-Tree where all values are stored in leaf nodes for efficient range queries.</p>
        </div>
        <Link to="/tree-dsa" className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 transition">
          Back to Landing
        </Link>
      </header>

      {/* Visualization Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Controls */}
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
              className="flex-1 bg-green-600 text-white py-2 rounded-lg shadow hover:bg-green-500 disabled:opacity-60 transition"
            >
              Insert Node
            </button>
            <button
              onClick={() => animateTree("delete", inputValue)}
              disabled={isAnimating || !inputValue}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg shadow hover:bg-red-500 disabled:opacity-60 transition"
            >
              Delete Node
            </button>
            <button
              onClick={() => animateTree("display", inputValue)}
              disabled={isAnimating}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg shadow hover:bg-blue-500 disabled:opacity-60 transition"
            >
              Display Root
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
            <h2 className="text-lg font-semibold mb-2 text-green-400">Algorithm Steps</h2>
            {algorithmSteps.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-gray-200">
                {algorithmSteps.map((step, index) => <li key={index} className="mb-1">{step}</li>)}
              </ul>
            ) : (
              <p className="text-gray-500">No steps to display. Perform an operation to see the algorithm steps.</p>
            )}
          </div>
        </div>

        {/* Tree Display */}
        <div ref={treeContainerRef} className="bg-gray-800 p-4 rounded-xl shadow-lg h-[60vh] overflow-hidden lg:col-span-2">
          {treeData ? (
            <Tree
              data={treeData}
              orientation="vertical"
              translate={getDynamicTranslate()}
              renderCustomNodeElement={(props) => <CustomNode {...props} />}
              pathClassFunc={() => "stroke-gray-400 stroke-2"}
              zoomable
              collapsible
              initialDepth={2}
              separation={{ siblings: 1.5, nonSiblings: 2 }}
            />
          ) : (
            <p className="text-gray-500 h-full grid place-items-center text-center">Enter values and use buttons to visualize the tree.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BPlusTree;
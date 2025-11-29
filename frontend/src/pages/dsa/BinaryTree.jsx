import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Tree from "react-d3-tree";
import { deepCopy, toConvert, getNodeName, createNode, findAndMarkDeleting, getAlgorithmSteps } from "../../utils/treeHelpers";

const insertBinary = (root, value) => {
  if (!root) return createNode(value, "Binary Tree");
  const newNode = createNode(value, "Binary Tree");
  const queue = [root];
  while (queue.length) {
    const cur = queue.shift();
    if (!cur.left) {
      cur.left = newNode;
      return root;
    } else queue.push(cur.left);
    if (!cur.right) {
      cur.right = newNode;
      return root;
    } else queue.push(cur.right);
  }
  return root;
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
  let tree = variables["tree"] || {};
  let root = tree.root;
  let states = [];

  if (!root && operation !== "insert") return [];

  if (operation === "insert") {
    let newRoot = insertBinary(root, params.value);
    if (newRoot) root = newRoot;
  } else if (operation === "delete") {
    let tempRoot = findAndMarkDeleting(root, params.value, treeType);
    if (tempRoot) {
      states.push(toConvert(tempRoot, treeType, getNodeName));
      root = deepCopy(tempRoot);
    }
    let newRoot = deleteBST(root, params.value);
    if (newRoot) root = newRoot;
    states.push(toConvert(root, treeType, getNodeName));
  }

  tree.root = root;
  variables["tree"] = tree;
  if (states.length === 0 && root) states.push(toConvert(root, treeType, getNodeName));
  return states;
};

function BinaryTree() {
  const treeType = "Binary Tree";
  const [treeData, setTreeData] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [algorithmSteps, setAlgorithmSteps] = useState([]);
  const [variables, setVariables] = useState({ tree: { root: null } });
  const [isMobile, setIsMobile] = useState(false);

  const stepsRef = useRef(null);
  const treeContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (stepsRef.current) {
      stepsRef.current.scrollTop = stepsRef.current.scrollHeight;
    }
  }, [algorithmSteps]);

  const animateTree = async (operation, value) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAlgorithmSteps([]);
    setTreeData(null);

    let newVariables = { ...variables };
    let states = [];
    let steps = [];

    if (operation === "insert" && inputValue) {
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
      await new Promise((r) => setTimeout(r, animationSpeed));
    }

    setIsAnimating(false);
  };

  const CustomNode = ({ nodeDatum }) => {
    const nodeRadius = isMobile ? 20 : 20;
    const textSize = isMobile ? 12 : 12;
    
    return (
      <g>
        <circle r={nodeRadius} fill="#ffffff" stroke="#10b981" strokeWidth={2} />
        <text x="0" y="0" fontSize={textSize} fill="#000000" textAnchor="middle" alignmentBaseline="middle" fontWeight="bold">
          {nodeDatum.name}
        </text>
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-2 sm:p-4">
      <header className="bg-gray-800 p-3 sm:p-4 shadow-md mb-3 sm:mb-4 rounded-lg sm:rounded-xl flex items-center justify-center relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-2 sm:left-4 flex items-center gap-2 px-2 sm:px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg border border-gray-600 transition text-xs sm:text-sm"
        >
          <span>←</span>
          <span>Back</span>
        </button>

        <div className="text-center">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-100">Binary Tree</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Level-order insert visualization</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 auto-rows-max lg:auto-rows-auto">
        <div className="bg-gray-800 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg lg:row-span-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value"
            className="w-full p-2 sm:p-3 rounded-lg border border-gray-700 bg-gray-900 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-green-400 outline-none mb-2 sm:mb-3 text-sm sm:text-base"
          />

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 mb-2 sm:mb-3">
            <button
              onClick={() => animateTree("insert", inputValue)}
              disabled={isAnimating || !inputValue}
              className="flex-1 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-500 disabled:opacity-60 transition text-sm sm:text-base"
            >
              Insert
            </button>
            <button
              onClick={() => animateTree("delete", inputValue)}
              disabled={isAnimating || !inputValue}
              className="flex-1 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-500 disabled:opacity-60 transition text-sm sm:text-base"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setVariables({ tree: { root: null } });
                setTreeData(null);
                setAlgorithmSteps([]);
                setInputValue("");
              }}
              className="flex-1 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-500 transition text-sm sm:text-base"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3 sm:mb-6">
            <label className="text-xs sm:text-sm text-gray-300">Speed:</label>
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(Number(e.target.value))}
              className="flex-1 accent-green-500"
            />
            <span className="text-xs sm:text-sm text-gray-300 w-12 sm:w-14 text-right">{animationSpeed}</span>
          </div>

          <div className="bg-gray-900 p-3 sm:p-4 rounded-lg max-h-48 sm:max-h-64 overflow-y-auto border border-gray-700">
            <h2 className="text-sm sm:text-lg font-semibold mb-2 text-green-400">Steps</h2>
            {algorithmSteps.length > 0 ? (
              <ul className="list-disc pl-4 text-xs sm:text-sm text-gray-200 space-y-1">
                {algorithmSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-xs">Perform an operation...</p>
            )}
          </div>
        </div>

        <div
          className="bg-gray-800 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg overflow-hidden lg:col-span-2 min-h-96 sm:min-h-[60vh] border border-gray-700"
          ref={treeContainerRef}
        >
          {treeData ? (
            <Tree
              data={treeData}
              orientation="vertical"
              translate={{ x: window.innerWidth / 2 / 2, y: 60 }}
              renderCustomNodeElement={(props) => <CustomNode {...props} />}
              pathClassFunc={() => "stroke-green-500 stroke-2"}
              zoomable
              collapsible
              separation={{ siblings: isMobile ? 1 : 1.5, nonSiblings: isMobile ? 1.5 : 2 }}
            />
          ) : (
            <p className="text-gray-500 h-full grid place-items-center text-center text-sm sm:text-base px-4">
              Enter values and use buttons to visualize the tree.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BinaryTree;
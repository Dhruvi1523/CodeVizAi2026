// AVLTree.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Tree from "react-d3-tree";

/* -------------------------
   Minimal helpers (self-contained)
   ------------------------- */

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

const createNode = (value) => ({
  value,
  left: null,
  right: null,
  height: 1,
  // attributes used by visualization
  attributes: {
    newlyInserted: false,
    comparing: false,
    deleting: false,
    imbalance: false,
  },
});

const getNodeName = (node) => `${node.value}`;

const toConvert = (node, treeType) => {
  if (!node) return null;
  // recursively convert to react-d3-tree format and copy attributes
  const convert = (n) => {
    if (!n) return null;
    const children = [];
    if (n.left) children.push(convert(n.left));
    if (n.right) children.push(convert(n.right));
    // attach attributes copy and height so CustomNode can use them
    return {
      name: getNodeName(n),
      attributes: {
        ...n.attributes,
        height: n.height,
      },
      children,
    };
  };
  return convert(node);
};

const getAlgorithmSteps = (operation, value) => {
  const v = value;
  return operation === "insert"
    ? [`Insert ${v}: traverse to insert node, then rebalance upwards.`]
    : [`Delete ${v}: search node, remove, then rebalance upwards.`];
};

/* -------------------------
   AVL rotations & helpers
   ------------------------- */

const getHeight = (node) => (node ? node.height : 0);
const updateHeight = (node) => {
  node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
};
const getBalance = (node) => (node ? getHeight(node.left) - getHeight(node.right) : 0);

const rotateRightAVL = (y) => {
  const x = y.left;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  updateHeight(y);
  updateHeight(x);
  return x;
};

const rotateLeftAVL = (x) => {
  const y = x.right;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  updateHeight(x);
  updateHeight(y);
  return y;
};

/* -------------------------
   Insert / Delete with state captures
   ------------------------- */

/*
  Approach:
  - Maintain a top-level rootObject = { root } so recursive functions can
    push a full-tree snapshot easily (using rootObject.root).
  - Before every comparison we mark node.attributes.comparing = true,
    push state, then set false and continue (so the UI shows the comparison).
  - After creating a new node we mark newlyInserted = true for one snapshot.
  - When we detect imbalance we mark node.attributes.imbalance = true for a snapshot.
  - After rotations we push snapshots as well.
*/

const pushState = (rootObject, states) => {
  // create a visual tree from a deep-copied structural root
  const visualRoot = deepCopy(rootObject.root);
  states.push(toConvert(visualRoot, "AVL"));
};

const insertAVLRecursive = (rootObject, node, value, states) => {
  if (!node) {
    const newNode = createNode(value);
    // mark new node as inserted for immediate visualization
    newNode.attributes.newlyInserted = true;
    // attach to rootObject immediately for correct full-tree snapshots higher up
    // (the parent caller will assign it)
    return newNode;
  }

  // show we are comparing this node
  node.attributes.comparing = true;
  pushState(rootObject, states);
  node.attributes.comparing = false;

  if (value < node.value) {
    node.left = insertAVLRecursive(rootObject, node.left, value, states);
  } else if (value > node.value) {
    node.right = insertAVLRecursive(rootObject, node.right, value, states);
  } else {
    // duplicate - no insertion; show comparison result
    pushState(rootObject, states);
    return node;
  }

  // update height and show
  updateHeight(node);
  pushState(rootObject, states);

  // check balance
  const balance = getBalance(node);
  if (Math.abs(balance) > 1) {
    node.attributes.imbalance = true;
    pushState(rootObject, states);
    // identify rotation case
    if (balance > 1) {
      // left heavy
      if (value < node.left.value) {
        // Left Left
        const newSub = rotateRightAVL(node);
        // reset imbalance flags (they were deep-copied in snapshot; but for correctness remove here)
        if (newSub.attributes) newSub.attributes.imbalance = false;
        pushState({ root: rootObject.root === node ? newSub : rootObject.root }, states);
        return newSub;
      } else {
        // Left Right
        node.left = rotateLeftAVL(node.left);
        const newSub = rotateRightAVL(node);
        pushState({ root: rootObject.root === node ? newSub : rootObject.root }, states);
        return newSub;
      }
    } else {
      // right heavy
      if (value > node.right.value) {
        // Right Right
        const newSub = rotateLeftAVL(node);
        pushState({ root: rootObject.root === node ? newSub : rootObject.root }, states);
        return newSub;
      } else {
        // Right Left
        node.right = rotateRightAVL(node.right);
        const newSub = rotateLeftAVL(node);
        pushState({ root: rootObject.root === node ? newSub : rootObject.root }, states);
        return newSub;
      }
    }
  }

  return node;
};

const findMinNode = (node) => {
  while (node.left) node = node.left;
  return node;
};

const deleteAVLRecursive = (rootObject, node, value, states) => {
  if (!node) return null;

  // show comparison
  node.attributes.comparing = true;
  pushState(rootObject, states);
  node.attributes.comparing = false;

  if (value < node.value) {
    node.left = deleteAVLRecursive(rootObject, node.left, value, states);
  } else if (value > node.value) {
    node.right = deleteAVLRecursive(rootObject, node.right, value, states);
  } else {
    // node found: mark deleting for snapshot
    node.attributes.deleting = true;
    pushState(rootObject, states);
    node.attributes.deleting = false;

    // deletion cases
    if (!node.left || !node.right) {
      const temp = node.left ? node.left : node.right;
      if (!temp) {
        // no children
        node = null;
      } else {
        // one child
        node = temp;
      }
    } else {
      // two children: get inorder successor
      const succ = findMinNode(node.right);
      node.value = succ.value;
      // show replacement
      pushState(rootObject, states);
      node.right = deleteAVLRecursive(rootObject, node.right, succ.value, states);
    }
  }

  if (!node) return node;

  // update height and push
  updateHeight(node);
  pushState(rootObject, states);

  // balance
  const balance = getBalance(node);
  if (Math.abs(balance) > 1) {
    node.attributes.imbalance = true;
    pushState(rootObject, states);

    // Left heavy
    if (balance > 1) {
      if (getBalance(node.left) >= 0) {
        const newSub = rotateRightAVL(node);
        pushState({ root: rootObject.root === node ? newSub : rootObject.root }, states);
        return newSub;
      } else {
        node.left = rotateLeftAVL(node.left);
        const newSub = rotateRightAVL(node);
        pushState({ root: rootObject.root === node ? newSub : rootObject.root }, states);
        return newSub;
      }
    } else {
      // Right heavy
      if (getBalance(node.right) <= 0) {
        const newSub = rotateLeftAVL(node);
        pushState({ root: rootObject.root === node ? newSub : rootObject.root }, states);
        return newSub;
      } else {
        node.right = rotateRightAVL(node.right);
        const newSub = rotateLeftAVL(node);
        pushState({ root: rootObject.root === node ? newSub : rootObject.root }, states);
        return newSub;
      }
    }
  }

  return node;
};

/* -------------------------
   Main Component
   ------------------------- */

function AVLTree() {
  const treeType = "AVL Tree";
  const [treeData, setTreeData] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [animationSpeed, setAnimationSpeed] = useState(700);
  const [algorithmSteps, setAlgorithmSteps] = useState([]);
  const [variables, setVariables] = useState({ tree: { root: null } });
  const treeContainerRef = useRef();

  const clearTree = () => {
    setVariables({ tree: { root: null } });
    setTreeData(null);
    setAlgorithmSteps([]);
    setInputValue("");
  };

  const simulateOperation = (operation, value) => {
    const states = [];
    const newVars = deepCopy(variables);
    const rootObject = { root: newVars.tree.root };

    if (operation === "insert") {
      // check duplicates quickly (non-animated)
      const exists = (n, v) => {
        while (n) {
          if (v === n.value) return true;
          n = v < n.value ? n.left : n.right;
        }
        return false;
      };
      if (exists(rootObject.root, value)) {
        // still animate the comparison pass
        // but here we simply return an empty states to indicate no actual insertion
        return { states: [], newVars };
      }
      rootObject.root = insertAVLRecursive(rootObject, rootObject.root, value, states);
    } else if (operation === "delete") {
      // check existence
      const exists = (n, v) => {
        while (n) {
          if (v === n.value) return true;
          n = v < n.value ? n.left : n.right;
        }
        return false;
      };
      if (!exists(rootObject.root, value)) {
        return { states: [], newVars };
      }
      rootObject.root = deleteAVLRecursive(rootObject, rootObject.root, value, states);
    }

    newVars.tree.root = rootObject.root;

    // if states were empty but we have a root, push final snapshot
    if (states.length === 0 && newVars.tree.root) {
      states.push(toConvert(deepCopy(newVars.tree.root), treeType));
    }

    return { states, newVars };
  };

  const animateTree = async (operation, valueStr) => {
    if (!valueStr && valueStr !== 0) return alert("Please enter a value!");
    if (isAnimating) return;

    const value = parseInt(valueStr, 10);
    if (Number.isNaN(value)) return alert("Enter a valid integer");

    setIsAnimating(true);
    setAlgorithmSteps(getAlgorithmSteps(operation, value));

    const { states, newVars } = simulateOperation(operation, value);

    if (states.length === 0) {
      if (operation === "delete") alert("Value not found in tree!");
      else if (operation === "insert") alert("Value already exists in tree!");
      setIsAnimating(false);
      return;
    }

    for (let i = 0; i < states.length; i++) {
      setTreeData(states[i]);
      // small delay to allow React to render
      await new Promise((res) => setTimeout(res, animationSpeed));
    }

    setVariables(newVars);
    setIsAnimating(false);
  };

  const getDynamicTranslate = () => {
    if (treeContainerRef.current) {
      const { width, height } = treeContainerRef.current.getBoundingClientRect();
      return { x: width / 2, y: 80 };
    }
    return { x: 400, y: 80 };
  };

  const getDepth = (node) => (node ? 1 + Math.max(getDepth(node.left), getDepth(node.right)) : 0);
  const depth = variables.tree.root ? getDepth(variables.tree.root) : 1;

  const CustomNode = ({ nodeDatum }) => {
    let fill = "#90ee90"; // default light green
    if (nodeDatum.attributes?.deleting) fill = "#cccccc";
    if (nodeDatum.attributes?.imbalance) fill = "#ff6b6b"; // red-ish
    if (nodeDatum.attributes?.comparing) fill = "#fff176"; // yellow
    if (nodeDatum.attributes?.newlyInserted) fill = "#00ff00";

    let text = nodeDatum.name;
    if (nodeDatum.attributes?.height !== undefined) text += ` (h:${nodeDatum.attributes.height})`;

    return (
      <g>
        <circle r={22} fill={fill} stroke="#333" strokeWidth={2} />
        <text
          x="0"
          y="0"
          fontSize={12}
          textAnchor="middle"
          alignmentBaseline="middle"
          fill="#000"
          style={{ fontWeight: "600" }}
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
          <h1 className="text-2xl font-bold text-gray-100">AVL Tree Visualizer</h1>
          <p className="text-sm text-gray-400 mt-1">Self-balancing BST — shows comparisons, rotations & heights.</p>
        </div>
        <Link to="/tree-dsa" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition">
          Back to Landing
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter integer value"
            className="p-2 rounded-lg border border-gray-700 bg-gray-900 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-green-400 outline-none w-full mb-3"
          />

          <div className="flex gap-2 mb-3">
            <button
              onClick={() => animateTree("insert", inputValue)}
              disabled={isAnimating || inputValue === ""}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg shadow hover:bg-green-500 disabled:opacity-60 transition"
            >
              Insert
            </button>
            <button
              onClick={() => animateTree("delete", inputValue)}
              disabled={isAnimating || inputValue === ""}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg shadow hover:bg-red-500 disabled:opacity-60 transition"
            >
              Delete
            </button>
            <button onClick={clearTree} className="flex-1 bg-gray-600 text-white py-2 rounded-lg shadow hover:bg-gray-500 transition">
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <label className="text-sm text-gray-300">Speed:</label>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
              className="w-32 accent-green-500"
            />
            <span className="text-gray-300">{animationSpeed} ms</span>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg h-48 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2 text-green-400">Algorithm Steps</h2>
            {algorithmSteps.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-gray-200">
                {algorithmSteps.map((step, index) => (
                  <li key={index} className="mb-1">
                    {step}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Perform an operation to see algorithm steps.</p>
            )}
          </div>
        </div>

        <div ref={treeContainerRef} className="bg-gray-800 p-4 rounded-xl shadow-lg h-[70vh] overflow-hidden lg:col-span-2">
          {treeData ? (
            <Tree
              data={treeData}
              translate={getDynamicTranslate()}
              orientation="vertical"
              pathFunc="diagonal"
              renderCustomNodeElement={(rd3tProps) => <CustomNode {...rd3tProps} />}
              zoomable
              collapsible={false}
              separation={{
                siblings: Math.max(1.5, 3 - depth * 0.12),
                nonSiblings: Math.max(2, 4 - depth * 0.2),
              }}
            />
          ) : (
            <p className="text-gray-500 h-full grid place-items-center text-center">Tree is empty. Insert values to begin.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AVLTree;

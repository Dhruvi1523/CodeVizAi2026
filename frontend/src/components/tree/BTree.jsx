import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Tree from "react-d3-tree";
import { deepCopy, getAlgorithmSteps } from "../../utils/treeHelpers";

/**
 * B-Tree visualizer with:
 *  - full delete (borrow/merge) algorithm
 *  - snapshot-based animation
 *  - "key-move" highlighting (visual indicator of movement)
 *
 * ORDER is configurable.
 */

const ORDER = 3; // change to experiment; ORDER >= 3
const SLOTS = ORDER - 1;
const SLOT_WIDTH = 48;
const SLOT_GAP = 6;
const SLOT_HEIGHT = 34;

const createNode = (keys = [], children = [], isLeaf = true) => ({
  keys,
  children,
  isLeaf,
});

// convert internal node to react-d3-tree node with attributes.keys and optional meta (moving)
const convertToTree = (node, metaMap = {}) => {
  if (!node) return null;
  const convert = (n, path = "") => {
    if (!n) return null;
    const children = (n.children || []).map((c, i) => convert(c, path === "" ? `${i}` : `${path}-${i}`)).filter(Boolean);
    return {
      name: n.keys.join(" | "),
      attributes: {
        keys: [...n.keys],
        isLeaf: !!n.isLeaf,
        path,
        movingSlots: metaMap[path] ? metaMap[path].movingSlots : undefined,
        highlight: metaMap[path] ? metaMap[path].highlight : undefined,
      },
      children,
    };
  };
  return convert(node, "");
};

// utility: find index in node where key should be (first >=)
const findKeyIndex = (keys, k) => {
  let i = 0;
  while (i < keys.length && k > keys[i]) i++;
  return i;
};

// === Snapshot system helpers ===
// snapshots: array of { tree: convertedTree, note: 'text', metaMap: {path: { movingSlots: [...], highlight: true }} }
const pushSnapshot = (snapshots, root, note = "", metaMap = {}) => {
  snapshots.push({
    tree: convertToTree(root, metaMap),
    note,
    metaMap,
  });
};

// === B-Tree core algorithms with snapshot recording ===

/**
 * splitChild(parent, idx)
 * standard split: parent.children[idx] is full (has ORDER-1 keys)
 * After split, parent gets middle key, children replaced by left/right
 */
const splitChild = (parent, idx, order, snapshots, rootRef) => {
  const full = parent.children[idx];
  const t = Math.floor((order - 1) / 2);
  const midKey = full.keys[t];

  const left = createNode(full.keys.slice(0, t), (full.children || []).slice(0, t + 1), full.isLeaf);
  const right = createNode(full.keys.slice(t + 1), (full.children || []).slice(t + 1), full.isLeaf);

  parent.keys.splice(idx, 0, midKey);
  parent.children.splice(idx, 1, left, right);

  // mark meta: show splitting location and the midKey being moved up
  const meta = {};
  // parent path is unknown here; snapshots will use rootRef to build mapping via nodePaths later
  pushSnapshot(snapshots, rootRef.root, `Split child at parent: move ${midKey} up`, buildMetaMapForSplit(rootRef.root, parent, idx, midKey));
};

// helper to build metaMap marking the moving key slot during split
const buildMetaMapForSplit = (root, parentNode, childIndex, midKey) => {
  // we need to find path strings for parent and the child. We'll do traversal to find references.
  const meta = {};
  const findPaths = (n, path = "") => {
    if (!n) return [];
    const results = [];
    if (n === parentNode) results.push({ path });
    (n.children || []).forEach((c, i) => {
      const childPaths = findPaths(c, path === "" ? `${i}` : `${path}-${i}`);
      results.push(...childPaths);
    });
    return results;
  };
  const parents = findPaths(root, "");
  const parentPath = parents.length ? parents[0].path : ""; // assume first match
  if (parentPath !== undefined) {
    meta[parentPath] = meta[parentPath] || {};
    // mark the new key in parent's slot (we don't know exact slot index, highlight all for simplicity)
    meta[parentPath].highlight = `Moved ${midKey} up`;
  }
  return meta;
};

// insertNonFull with snapshots
const insertNonFull = (node, key, order, snapshots, rootRef) => {
  if (node.isLeaf) {
    if (!node.keys.includes(key)) {
      node.keys.push(key);
      node.keys.sort((a, b) => a - b);
      pushSnapshot(snapshots, rootRef.root, `Insert ${key} into leaf`, {});
    }
    return;
  }

  let i = findKeyIndex(node.keys, key);
  // if child is full, split
  if (node.children[i].keys.length === order - 1) {
    // snapshot before split showing full child
    pushSnapshot(snapshots, rootRef.root, `Preparing to split child at index ${i}`, {});
    splitChild(node, i, order, snapshots, rootRef);
    // after split, decide to which child we descend
    if (key > node.keys[i]) i++;
    pushSnapshot(snapshots, rootRef.root, `After split, descending to child ${i}`, {});
  }
  insertNonFull(node.children[i], key, order, snapshots, rootRef);
};

// wrapper to insert with snapshots and maintain root reference object
const insertBTreeWithSnapshots = (root, key, order) => {
  const snapshots = [];
  let rootNode = root ? deepCopy(root) : null;
  const rootRef = { root: rootNode };

  if (!rootNode) {
    rootNode = createNode([key], [], true);
    rootRef.root = rootNode;
    pushSnapshot(snapshots, rootRef.root, `Create new root with ${key}`, {});
    return { root: rootNode, snapshots };
  }

  rootRef.root = rootNode;
  if (rootNode.keys.length === order - 1) {
    // root full -> create new root and split
    const newRoot = createNode([], [rootNode], false);
    rootRef.root = newRoot;
    // split child 0
    splitChild(newRoot, 0, order, snapshots, rootRef);
    // insert into correct child
    let i = findKeyIndex(newRoot.keys, key);
    if (key > newRoot.keys[i]) i++;
    insertNonFull(newRoot.children[i], key, order, snapshots, rootRef);
    pushSnapshot(snapshots, rootRef.root, `Inserted ${key} after root split`, {});
    return { root: newRoot, snapshots };
  } else {
    insertNonFull(rootNode, key, order, snapshots, rootRef);
    pushSnapshot(snapshots, rootNode, `Inserted ${key}`, {});
    return { root: rootNode, snapshots };
  }
};

// === Deletion (full algorithm) with snapshots ===
// We'll implement recursive deletion with ensureMin (borrow or merge) strategy.
// Helpers:

const getMinFromNode = (node) => {
  let cur = node;
  while (!cur.isLeaf) cur = cur.children[0];
  return cur.keys[0];
};

// ensure child at index i has at least minKeys; performs borrow or merge, records snapshots
const ensureChildHasMin = (parent, idx, order, snapshots, rootRef) => {
  const minKeys = Math.ceil(order / 2) - 1;
  const child = parent.children[idx];

  if (child.keys.length >= minKeys) return;

  // try borrow from left sibling
  if (idx - 1 >= 0 && parent.children[idx - 1].keys.length > minKeys) {
    const left = parent.children[idx - 1];
    // move parent's key down to child, pop key from left up to parent
    child.keys.unshift(parent.keys[idx - 1]);
    parent.keys[idx - 1] = left.keys.pop();
    if (!left.isLeaf) child.children.unshift(left.children.pop());
    pushSnapshot(snapshots, rootRef.root, `Borrow from left sibling for child ${idx}`, {});
    return;
  }

  // try borrow from right sibling
  if (idx + 1 < parent.children.length && parent.children[idx + 1].keys.length > minKeys) {
    const right = parent.children[idx + 1];
    child.keys.push(parent.keys[idx]);
    parent.keys[idx] = right.keys.shift();
    if (!right.isLeaf) child.children.push(right.children.shift());
    pushSnapshot(snapshots, rootRef.root, `Borrow from right sibling for child ${idx}`, {});
    return;
  }

  // otherwise merge with sibling
  if (idx - 1 >= 0) {
    // merge child with left sibling
    const left = parent.children[idx - 1];
    left.keys.push(parent.keys[idx - 1], ...child.keys);
    if (!child.isLeaf) left.children = left.children.concat(child.children);
    parent.children.splice(idx, 1);
    parent.keys.splice(idx - 1, 1);
    pushSnapshot(snapshots, rootRef.root, `Merged child ${idx} with left sibling`, {});
    return;
  } else {
    // merge with right sibling
    const right = parent.children[idx + 1];
    child.keys.push(parent.keys[idx], ...right.keys);
    if (!right.isLeaf) child.children = child.children.concat(right.children);
    parent.children.splice(idx + 1, 1);
    parent.keys.splice(idx, 1);
    pushSnapshot(snapshots, rootRef.root, `Merged child ${idx} with right sibling`, {});
    return;
  }
};

// recursive deletion
const deleteFromNode = (node, k, order, snapshots, rootRef) => {
  const minKeys = Math.ceil(order / 2) - 1;

  const idx = findKeyIndex(node.keys, k);

  // Case 1: key present in node
  if (idx < node.keys.length && node.keys[idx] === k) {
    if (node.isLeaf) {
      // remove directly
      node.keys.splice(idx, 1);
      pushSnapshot(snapshots, rootRef.root, `Deleted ${k} from leaf`, {});
      return true;
    } else {
      // internal node: replace with predecessor or successor
      const predChild = node.children[idx];
      const succChild = node.children[idx + 1];
      if (predChild.keys.length > minKeys) {
        // find predecessor
        let cur = predChild;
        while (!cur.isLeaf) cur = cur.children[cur.children.length - 1];
        const pred = cur.keys[cur.keys.length - 1];
        node.keys[idx] = pred;
        pushSnapshot(snapshots, rootRef.root, `Replace ${k} with predecessor ${pred}`, {});
        return deleteFromNode(predChild, pred, order, snapshots, rootRef);
      } else if (succChild.keys.length > minKeys) {
        // find successor
        let cur = succChild;
        while (!cur.isLeaf) cur = cur.children[0];
        const succ = cur.keys[0];
        node.keys[idx] = succ;
        pushSnapshot(snapshots, rootRef.root, `Replace ${k} with successor ${succ}`, {});
        return deleteFromNode(succChild, succ, order, snapshots, rootRef);
      } else {
        // both children have minKeys -> merge and then delete from merged child
        // merge predChild + k + succChild into one
        predChild.keys.push(node.keys[idx], ...succChild.keys);
        if (!succChild.isLeaf) predChild.children = predChild.children.concat(succChild.children);
        node.keys.splice(idx, 1);
        node.children.splice(idx + 1, 1);
        pushSnapshot(snapshots, rootRef.root, `Merged children around ${k} to delete`, {});
        return deleteFromNode(predChild, k, order, snapshots, rootRef);
      }
    }
  } else {
    // key not in node, descend to child idx
    if (node.isLeaf) {
      // not found
      return false;
    }
    // ensure child has enough keys
    ensureChildHasMin(node, idx, order, snapshots, rootRef);
    // after ensure, child may have changed; recompute child pointer
    let childIdx = idx;
    if (childIdx > node.children.length - 1) childIdx = node.children.length - 1;
    return deleteFromNode(node.children[childIdx], k, order, snapshots, rootRef);
  }
};

// delete wrapper
const deleteBTreeWithSnapshots = (root, k, order) => {
  const snapshots = [];
  if (!root) return { root: null, snapshots, existed: false };
  const rootRef = { root: deepCopy(root) };

  // quick existence check
  if (!valueExists(rootRef.root, k)) return { root: rootRef.root, snapshots: [], existed: false };

  // start deletion
  const existed = deleteFromNode(rootRef.root, k, order, snapshots, rootRef);

  // if root has no keys and has one child, make child new root
  if (rootRef.root.keys.length === 0 && rootRef.root.children && rootRef.root.children.length === 1) {
    rootRef.root = rootRef.root.children[0];
    pushSnapshot(snapshots, rootRef.root, `Root collapsed after deletion`, {});
  } else {
    pushSnapshot(snapshots, rootRef.root, `Finish deletion of ${k}`, {});
  }

  return { root: rootRef.root, snapshots, existed };
};

const valueExists = (node, val) => {
  if (!node) return false;
  if (node.keys.includes(val)) return true;
  if (node.isLeaf) return false;
  const idx = findKeyIndex(node.keys, val);
  return valueExists(node.children[idx], val);
};

// === Simulation wrapper ===
const simulateOperation = (variables, operation, value, order = ORDER) => {
  const currentRoot = variables?.tree?.root ? deepCopy(variables.tree.root) : null;
  if (operation === "insert") {
    const { root, snapshots } = insertBTreeWithSnapshots(currentRoot, value, order);
    return { root, snapshots };
  } else if (operation === "delete") {
    const { root, snapshots, existed } = deleteBTreeWithSnapshots(currentRoot, value, order);
    return { root, snapshots, existed };
  }
  return { root: currentRoot, snapshots: [] };
};

// === React component ===

function BTree() {
  const treeType = "B-Tree";
  const [variables, setVariables] = useState({ tree: { root: null } });
  const [treeData, setTreeData] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [animationSpeed, setAnimationSpeed] = useState(700);
  const [algorithmSteps, setAlgorithmSteps] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef();

  useEffect(() => {
    setVariables({ tree: { root: null } });
    setTreeData(null);
    setAlgorithmSteps([]);
  }, []);

  const clearTree = () => {
    setVariables({ tree: { root: null } });
    setTreeData(null);
    setInputValue("");
    setAlgorithmSteps([]);
  };

  const animateTree = async (operation) => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) {
      alert("Please enter a numeric value.");
      return;
    }
    if (isAnimating) return;
    setIsAnimating(true);
    setAlgorithmSteps([]);

    const newVars = deepCopy(variables);
    const { root, snapshots, existed } = simulateOperation(newVars, operation, val, ORDER);

    const stepsFromHelper = getAlgorithmSteps ? getAlgorithmSteps(operation, val, treeType) : [];
    setAlgorithmSteps(stepsFromHelper);

    if (operation === "delete" && (snapshots.length === 0 || existed === false)) {
      alert("Value not found or no changes required.");
      setIsAnimating(false);
      return;
    }
    if (operation === "insert" && snapshots.length === 0 && root) {
      snapshots.push({ tree: convertToTree(root, {}), note: `Inserted ${val}` });
    }

    // animate snapshots (each snapshot has .tree and .note)
    for (let i = 0; i < snapshots.length; i++) {
      const snap = snapshots[i];
      setTreeData(snap.tree);
      setAlgorithmSteps((prev) => {
        const copy = [...prev];
        copy[i] = copy[i] || snap.note || `Step ${i + 1}`;
        return copy;
      });
      await new Promise((r) => setTimeout(r, animationSpeed));
    }

    // commit final root
    newVars.tree.root = root || null;
    setVariables(newVars);
    setTreeData(root ? convertToTree(root, {}) : null);

    setIsAnimating(false);
  };

  const getDynamicTranslate = () => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      return { x: width / 2, y: Math.max(60, height / 8) };
    }
    return { x: 300, y: 120 };
  };

  // depth-based spacing
  const getDepth = (node) => {
    if (!node) return 0;
    if (node.isLeaf) return 1;
    return 1 + Math.max(...(node.children || []).map((c) => getDepth(c)));
  };
  const depth = variables.tree.root ? getDepth(variables.tree.root) : 1;
  const siblingsSep = Math.max(1.2, 3 - depth * 0.12);
  const nonSiblingsSep = Math.max(1.6, 4 - depth * 0.18);

  const CustomNode = ({ nodeDatum }) => {
    const keys = (nodeDatum.attributes && nodeDatum.attributes.keys) || [];
    const slots = SLOTS;
    const totalWidth = slots * SLOT_WIDTH + (slots - 1) * SLOT_GAP;
    const rectX = -totalWidth / 2;
    const rectY = -SLOT_HEIGHT / 2;

    return (
      <g>
        {Array.from({ length: slots }).map((_, i) => {
          const k = keys[i] !== undefined ? String(keys[i]) : "";
          const x = rectX + i * (SLOT_WIDTH + SLOT_GAP);
          const isMoving = nodeDatum.attributes?.movingSlots?.includes(i);
          const isHighlight = nodeDatum.attributes?.highlight;
          return (
            <g key={i}>
              <rect
                x={x}
                y={rectY}
                width={SLOT_WIDTH}
                height={SLOT_HEIGHT}
                rx={6}
                fill={isMoving ? "#f59e0b" : isHighlight ? "#ef4444" : "#2b6cb0"}
                stroke="#fff"
                strokeWidth={1.5}
              />
              <text
                x={x + SLOT_WIDTH / 2}
                y={rectY + SLOT_HEIGHT / 2}
                fontSize={14}
                fill="#fff"
                textAnchor="middle"
                alignmentBaseline="middle"
                style={{ pointerEvents: "none", fontWeight: 700 }}
              >
                {k}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4">
      <header className="bg-gray-800 p-4 shadow-md mb-4 rounded-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">B-Tree Visualizer</h1>
          <p className="text-sm text-gray-400 mt-1">
            Order {ORDER} B-Tree — slots shown per node. Includes full delete (borrow/merge) and key-move highlighting.
          </p>
        </div>
        <Link to="/tree-dsa" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition">
          Back to Landing
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg lg:col-span-1">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value"
            className="p-2 rounded-lg border border-gray-700 bg-gray-900 text-gray-200 placeholder-gray-400 w-full mb-3"
          />
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => animateTree("insert")}
              disabled={isAnimating || inputValue === ""}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-500 disabled:opacity-60 transition"
            >
              Insert
            </button>
            <button
              onClick={() => animateTree("delete")}
              disabled={isAnimating || inputValue === ""}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-500 disabled:opacity-60 transition"
            >
              Delete
            </button>
            <button onClick={clearTree} disabled={isAnimating} className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-500 transition">
              Clear
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm text-gray-300">Animation Speed (ms)</label>
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(Number(e.target.value))}
              className="w-36 accent-green-500"
            />
            <div className="text-gray-300">{animationSpeed} ms</div>
          </div>

          <div className="bg-gray-900 p-3 rounded-lg h-48 overflow-y-auto">
            <h2 className="text-lg font-semibold text-green-400 mb-2">Algorithm Steps</h2>
            {algorithmSteps.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-gray-200">
                {algorithmSteps.map((s, i) => (
                  <li key={i} className="mb-1">{s}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No steps yet. Perform an operation to see step narration.</p>
            )}
          </div>
        </div>

        <div ref={containerRef} className="bg-gray-800 p-4 rounded-xl shadow-lg h-[70vh] overflow-hidden lg:col-span-2">
          {treeData ? (
            <Tree
              data={treeData}
              translate={getDynamicTranslate()}
              orientation="vertical"
              renderCustomNodeElement={(props) => <CustomNode {...props} />}
              zoomable
              collapsible={false}
              separation={{ siblings: siblingsSep, nonSiblings: nonSiblingsSep }}
              pathFunc="elbow"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Tree is empty — insert values to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BTree;

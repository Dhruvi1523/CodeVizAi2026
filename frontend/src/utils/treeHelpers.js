// Shared helpers used across all tree files
export const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

// Convert node to react-d3-tree format
export const toConvert = (node, treeType, getNodeName) => {
  if (!node) return null;
  let converted = { name: getNodeName(node, treeType), children: [] };
  if (node.deleting) converted.attributes = { ...converted.attributes, deleting: true };

  if (treeType === "General Tree" || treeType.includes("B-Tree") || treeType.includes("B+Tree")) {
    for (const child of node.children || []) {
      if (child) converted.children.push(toConvert(child, treeType, getNodeName));
    }
  } else {
    if (node.left) converted.children.push(toConvert(node.left, treeType, getNodeName));
    if (node.right) converted.children.push(toConvert(node.right, treeType, getNodeName));
  }

  if (treeType === "Red Black Tree") {
    converted.attributes = { ...converted.attributes, color: node.color };
  } else if (treeType === "AVL Tree") {
    converted.attributes = { ...converted.attributes, height: node.height };
  }

  return converted;
};

export const getNodeName = (node, treeType) => {
  let name;
  if (treeType.includes("B-Tree") || treeType.includes("B+Tree")) {
    name = node.keys ? node.keys.join(", ") : "?";
  } else {
    name = node.name ?? node.value ?? node.key ?? "?";
  }
  return name;
};

export const createNode = (value, treeType) => {
  const node = { value };
  if (treeType === "Red Black Tree") node.color = "RED";
  if (treeType === "AVL Tree") node.height = 1;
  if (treeType === "General Tree" || treeType.includes("B-Tree") || treeType.includes("B+Tree")) {
    node.children = [];
  }
  if (treeType.includes("B-")) {
    node.keys = [value];
    node.isLeaf = true;
    delete node.value;
  }
  return node;
};

export const findAndMarkDeleting = (root, value, treeType) => {
  let copiedRoot = deepCopy(root);
  if (["Binary Search Tree", "AVL Tree", "Red Black Tree", "Binary Tree"].includes(treeType)) {
    let node = copiedRoot;
    while (node) {
      if (value < node.value) node = node.left;
      else if (value > node.value) node = node.right;
      else {
        node.deleting = true;
        return copiedRoot;
      }
    }
  } else if (treeType.includes("B-Tree") || treeType.includes("B+Tree")) {
    let node = copiedRoot;
    while (node) {
      let j = 0;
      while (j < node.keys.length && value > node.keys[j]) j++;
      if (j < node.keys.length && value === node.keys[j]) {
        node.deleting = true;
        return copiedRoot;
      }
      if (node.isLeaf) return null;
      node = node.children[j];
    }
  } else if (treeType === "General Tree") {
    const searchAndMark = (node) => {
      if (node.value === value) {
        node.deleting = true;
        return true;
      }
      for (let child of node.children || []) {
        if (searchAndMark(child)) return true;
      }
      return false;
    };
    if (searchAndMark(copiedRoot)) return copiedRoot;
  }
  return null;
};

export const getAlgorithmSteps = (operation, value, treeType) => {
  const steps = [];
  if (operation === "insert") {
    if (treeType === "Binary Tree") {
      steps.push("Finding next available spot in level order");
      steps.push("Inserting new node");
    } else if (treeType === "Binary Search Tree") {
      steps.push("Comparing value with current node");
      steps.push("Traversing left or right based on comparison");
      steps.push("Inserting new node at leaf");
    } else if (treeType === "AVL Tree") {
      steps.push("Inserting as in BST");
      steps.push("Updating heights");
      steps.push("Checking balance factor");
      steps.push("Performing rotations if needed");
    } else if (treeType === "Red Black Tree") {
      steps.push("Inserting as in BST");
      steps.push("Coloring new node red");
      steps.push("Fixing RB properties (rotations, recoloring)");
    } else if (treeType === "B-Tree") {
      steps.push("Finding appropriate leaf node");
      steps.push("Inserting key into node");
      steps.push("Splitting node if full");
    } else if (treeType === "B+Tree") {
      steps.push("Finding appropriate leaf node");
      steps.push("Inserting key into leaf");
      steps.push("Splitting node and updating separators if needed");
    } else if (treeType === "General Tree") {
      steps.push("Adding new node as child of root");
    }
  } else if (operation === "delete") {
    if (treeType === "Binary Search Tree") {
      steps.push("Searching for node to delete");
      steps.push("Handling leaf, single child, or two children case");
      steps.push("Replacing with successor if needed");
    } else if (treeType === "AVL Tree") {
      steps.push("Deleting as in BST");
      steps.push("Updating heights");
      steps.push("Rebalancing with rotations");
    } else if (treeType === "Red Black Tree") {
      steps.push("Deleting as in BST");
      steps.push("Fixing RB properties (rotations, recoloring)");
    } else if (treeType === "B-Tree") {
      steps.push("Finding key in node");
      steps.push("Removing key");
      steps.push("Balancing tree if needed (borrow or merge)");
    } else if (treeType === "B+Tree") {
      steps.push("Finding key in leaf");
      steps.push("Removing key");
      steps.push("Balancing tree if needed (borrow or merge)");
    } else if (treeType === "General Tree") {
      steps.push("Removing child node with matching value");
    }
  }
  return steps;
};
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { TreePine } from "lucide-react";

function LandingPage() {
  const treeData = [
    {
      path: "general-tree",
      type: "General Tree",
      title: "General Trees",
      desc: "A hierarchical data structure where each node can have an arbitrary number of child nodes. Unlike specialized trees like binary trees, general trees impose no such limitations.",
    },
    {
      path: "binary-tree",
      type: "Binary Tree",
      title: "Binary Trees",
      desc: "A binary tree consists of nodes where each node has at most two children — left and right. The topmost node is called the root, and every other node is connected by a parent-child relationship.",
    },
    {
      path: "binary-search-tree",
      type: "Binary Search Tree",
      title: "Binary Search Trees",
      desc: "A binary search tree (BST) maintains ordered data — all left subtree nodes are less than the parent node, and all right subtree nodes are greater — ensuring fast lookups and modifications.",
    },
    {
      path: "avl-tree",
      type: "AVL Tree",
      title: "AVL Trees",
      desc: "An AVL tree is a self-balancing binary search tree that ensures the height difference between left and right subtrees is at most one, maintaining O(log n) performance.",
    },
    {
      path: "red-black-tree",
      type: "Red Black Tree",
      title: "Red-Black Trees",
      desc: "A Red-Black Tree is a self-balancing binary search tree with nodes colored red or black to maintain balanced height for efficient insertion, deletion, and search.",
    },
    {
      path: "b-tree",
      type: "B-Tree",
      title: "B-Trees",
      desc: "A B-tree is a self-balancing tree data structure optimized for systems that read and write large blocks of data, maintaining sorted data for logarithmic operations.",
    },
    {
      path: "b-plus-tree",
      type: "B+Tree",
      title: "B+ Trees",
      desc: "A B+ tree is a type of B-tree where all data is stored in the leaves and internal nodes store only keys. It supports fast range queries and is widely used in databases.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {treeData.map((item) => (
            <div
              key={item.type}
              className="p-6 rounded-2xl shadow-md bg-[#1e293b] border border-[#334155] hover:border-[#6366f1] transition-all"
            >
              <TreePine className="h-8 w-8 text-[#6366f1] mb-4" />
              <h4 className="text-xl font-semibold mb-2 text-[#f1f5f9]">{item.title}</h4>
              <p className="text-[#94a3b8] text-sm mb-4">{item.desc}</p>
              <Link
                to={item.path}
                className="inline-block text-sm text-[#6366f1] hover:opacity-80 font-medium"
              >
                Learn more →
              </Link>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default LandingPage;

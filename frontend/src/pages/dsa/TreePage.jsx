// src/pages/dsa/TreePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  TreePine,
  GitBranch,
  Shuffle,
  Scale,
  Binary,
  Layers,
  Database,
} from "lucide-react";

export default function TreePage() {
  const basicTrees = [
    { id: "general", title: "General Tree", desc: "Hierarchical structure with arbitrary number of children.", path: "/tree/general-tree", icon: TreePine },
    { id: "binary", title: "Binary Tree", desc: "Each node has at most two children — left and right.", path: "/tree/binary-tree", icon: GitBranch },
    { id: "bst", title: "Binary Search Tree", desc: "Ordered tree for fast search, insert, and delete.", path: "/tree/binary-search-tree", icon: Shuffle },
  ];

  const advancedTrees = [
    { id: "avl", title: "AVL Tree", desc: "Self-balancing BST with O(log n) height using rotations.", path: "/tree/avl-tree", icon: Scale },
    { id: "redblack", title: "Red-Black Tree", desc: "Self-balancing using color properties.", path: "/tree/red-black-tree", icon: Binary },
     ];

  const TreeCard = ({ item }) => (
    <Link
      to={item.path}
      className="group flex flex-col h-full bg-[#1e293b] border border-[#334155]/50 rounded-xl p-6 hover:border-[#6366f1] hover:shadow-lg hover:shadow-[#6366f1]/10 transition-all duration-300"
    >
      <div className="mb-4">
        <item.icon className="w-8 h-8 text-[#6366f1] group-hover:scale-110 transition-transform duration-300" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
        {item.title}
      </h3>
      <p className="text-[#94a3b8] text-sm leading-relaxed mb-6 flex-grow">
        {item.desc}
      </p>
      <div className="flex items-center text-[#6366f1] font-medium text-sm group-hover:translate-x-1 transition-transform">
        Visualize <ArrowRight className="ml-1 w-4 h-4" />
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9] p-6 lg:p-12 font-sans relative">
      {/* Back Button – Fixed Top-Left */}
      <div className="absolute top-6 left-6 z-50">
        <Link
          to="/dsa-visualizer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1e293b] border border-[#334155] hover:border-[#6366f1] text-[#94a3b8] hover:text-white transition-all shadow-md group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">Back</span>
        </Link>
      </div>

      <div className="flex flex-col justify-center min-h-screen">
        <div className="max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-16 pt-16 md:pt-0">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] to-[#a855f7]">
                Tree Data Structure Visualizer
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-base sm:text-lg94 max-w-3xl mx-auto text-[#94a3b8]"
            >
              Select a tree type to explore its operations (Insert, Delete, Search, Traversals) and implementation details.
            </motion.p>
          </div>

          {/* Basic Trees */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-[#6366f1] mb-8 border-b border-[#334155] pb-4">
              Basic Tree Types
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {basicTrees.map((tree) => (
                <TreeCard key={tree.id} item={tree} />
              ))}
            </div>
          </motion.section>

          {/* Advanced Trees */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-[#6366f1] mb-8 border-b border-[#334155] pb-4">
              Advanced & Specialized Trees
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {advancedTrees.map((tree) => (
                <TreeCard key={tree.id} item={tree} />
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
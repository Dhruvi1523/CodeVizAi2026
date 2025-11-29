// src/pages/dsa/GraphLandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Network,
  Layers,
  GitBranch,
  ArrowUpDown,
  Search,
  Route,
} from "lucide-react";

export default function GraphLandingPage() {
  const graphAlgorithms = [
    {
      id: "bfs",
      title: "Breadth-First Search (BFS)",
      desc: "Explores all neighbors level by level. Ideal for shortest path in unweighted graphs.",
      path: "/graph/bfs",
      icon: Layers,
    },
    {
      id: "dfs",
      title: "Depth-First Search (DFS)",
      desc: "Goes as deep as possible down each branch before backtracking.",
      path: "/graph/dfs",
      icon: GitBranch,
    },
    
    {
      id: "connected",
      title: "Connected Components",
      desc: "Finds all disconnected subgraphs where nodes are reachable from each other.",
      path: "/graph/ConnectedComponents",
      icon: Network,
    },
    {
      id: "dijkstra",
      title: "Dijkstra's Algorithm",
      desc: "Finds shortest paths from source to all vertices in weighted graphs.",
      path: "/graph/dijkstra",
      icon: Route,
    },
  ];

  const GraphCard = ({ item }) => (
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

      <div className="flex items-center text-[#6366f1] font-medium text-sm group-hover:translate-x-1 transition-transform duration-300">
        Visualize <ArrowRight className="ml-1 w-4 h-4" />
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9] p-6 lg:p-12 font-sans relative">
      {/* Back Button - Top Left */}
      <div className="absolute top-6 left-6 z-50">
        <Link
          to="/dsa-visualizer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1e293b] border border-[#334155] hover:border-[#6366f1] text-[#94a3b8] hover:text-white transition-all shadow-md group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">Back</span>
        </Link>
      </div>

      {/* Main Content */}
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
                Graph Algorithms Visualizer
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-base sm:text-lg max-w-3xl mx-auto text-[#94a3b8]"
            >
              Explore powerful graph traversal and pathfinding algorithms with interactive animations.
            </motion.p>
          </div>

          {/* Graph Algorithms Grid */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-[#6366f1] mb-8 border-b border-[#334155] pb-4">
              Graph Algorithms & Concepts
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {graphAlgorithms.map((algo) => (
                <GraphCard key={algo.id} item={algo} />
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
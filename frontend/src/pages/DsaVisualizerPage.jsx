import React from 'react';
import { Link } from "react-router-dom";
import { Layers, Shuffle, List, Binary, TreePine, Box, Network, BrainCircuit } from "lucide-react";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const features = [
   {
    name: "Array",
    description: "LIFO data structure supporting push and pop operations. Visualize stack operations and state.",
    icon: Layers,
    path: "/array",
  },
  {
    name: "Stack",
    description: "LIFO data structure supporting push and pop operations. Visualize stack operations and state.",
    icon: Layers,
    path: "/stack",
  },
  {
    name: "Queue",
    description: "FIFO data structure for managing ordered elements. See enqueue and dequeue in action.",
    icon: Shuffle,
    path: "/queue",
  },
  {
    name: "Linked List",
    description: "Dynamic data structure with nodes connected through references. Explore different types of linked lists.",
    icon: List,
    path: "/linked-list",
  },
  {
    name: "Binary Search Tree",
    description: "A binary tree that maintains sorted data with O(log n) operations. Learn about tree traversals.",
    icon: Binary,
    path: "/bst",
  },
  {
    name: "AVL Tree",
    description: "Self-balancing BST that maintains height balance. Visualize rotations and balancing.",
    icon: TreePine,
    path: "/avl-tree",
  },
  {
    name: "Graph",
    description: "Representation of interconnected nodes and edges. Visualize BFS, DFS, and shortest path algorithms.",
    icon: Network,
    path: "/graph",
  },
  {
    name: "Heap",
    description: "Complete binary tree with heap property. Switch between min and max heaps.",
    icon: Box,
    path: "/heap",
  },
  {
    name: "Dynamic Programming",
    description: "Optimization technique to solve problems by breaking them into overlapping subproblems.",
    icon: BrainCircuit,
    path: "/dynamic-programming",
  },
  {
    name: "Sorting Algorithms",
    description: "Sorting Algorithms",
    icon: BrainCircuit,
    path: "/sorting",
  },
];

export default function DataStructures() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9]">
       <Navbar/>
      <div className="max-w-7xl mx-auto">
        
       
        {/* The main h2 title and p description have been removed for a cleaner look */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 py-6">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="p-6 rounded-2xl shadow-md bg-[#1e293b] border border-[#334155] hover:border-[#6366f1] transition-all"
            >
              <feature.icon className="h-8 w-8 text-[#6366f1] mb-4" />
              <h4 className="text-xl font-semibold mb-2 text-[#f1f5f9]">{feature.name}</h4>
              <p className="text-[#94a3b8] text-sm mb-4">{feature.description}</p>
              <Link
                to={feature.path}
                className="inline-block text-sm text-[#6366f1] hover:opacity-80 font-medium"
              >
                Learn more →
              </Link>
            </div>
          ))}
        </div>
      </div>
      <Footer/>
    </div>
  );
}
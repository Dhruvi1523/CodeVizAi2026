import React from 'react';
import { Link } from "react-router-dom";
import {
  Layers,
  SquareStack,
  Shuffle,
  ListOrdered,
  TreePine,
  Share2,
  Boxes,
  BrainCircuit,
  Hash,
} from "lucide-react";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const features = [
  {
    name: "Array",
    description: "Linear data structure that stores elements in contiguous memory locations, accessible via indices.",
    icon: SquareStack,
    path: "/array",
  },
  {
    name: "Stack",
    description: "LIFO (Last In, First Out) structure supporting push and pop operations. Ideal for recursion and backtracking.",
    icon: Layers,
    path: "/stack",
  },
  {
    name: "Queue",
    description: "FIFO (First In, First Out) structure enabling enqueue and dequeue operations. Useful for scheduling and BFS.",
    icon: Shuffle,
    path: "/queue",
  },
  {
    name: "Linked List",
    description: "A sequence of nodes connected through pointers. Supports dynamic memory allocation and efficient insertions/deletions.",
    icon: ListOrdered,
    path: "/linked-list",
  },
  {
    name: "Tree",
    description: "Hierarchical structure of nodes used for fast searching and sorting. Includes BST, AVL, and Red-Black Trees.",
    icon: TreePine,
    path: "/tree-dsa",
  },
  {
    name: "Graph",
    description: "Collection of nodes connected by edges. Helps visualize traversal algorithms like BFS, DFS, and shortest path.",
    icon: Share2,
    path: "/graph-dsa",
  },
  {
    name: "Heap",
    description: "Complete binary tree satisfying the heap property. Supports efficient priority queue operations.",
    icon: Boxes,
    path: "/heap",
  },
  {
    name: "Dynamic Programming",
    description: "Optimization technique solving complex problems by breaking them into overlapping subproblems using memoization or tabulation.",
    icon: BrainCircuit,
    path: "/dynamic-programming",
  },
  {
    name: "Hashing",
    description: "Technique to map data to fixed-size values for fast lookup using hash functions and hash tables.",
    icon: Hash,
    path: "/hashing",
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
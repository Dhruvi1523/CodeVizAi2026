import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { TreePine } from "lucide-react";

function LandingPage() {
  const treeData = [
  {
    title: "General Trees",
    desc: "A hierarchical data structure where each node can have an arbitrary number of child nodes.",
    path: "/tree/general-tree",
  },
  {
    title: "Binary Trees",
    desc: "A binary tree consists of nodes where each node has at most two children — left and right.",
    path: "/tree/binary-tree",
  },
  {
    title: "Binary Search Trees",
    desc: "A BST maintains ordered data for efficient searching and modification.",
    path: "/tree/binary-search-tree",
  },
  {
    title: "AVL Trees",
    desc: "A self-balancing binary search tree maintaining O(log n) performance.",
    path: "/tree/avl-tree",
  },
  {
    title: "Red-Black Trees",
    desc: "A self-balancing binary search tree with red and black nodes.",
    path: "/tree/red-black-tree",
  },
  {
    title: "B-Trees",
    desc: "A self-balancing tree optimized for systems reading/writing large blocks of data.",
    path: "/tree/b-tree",
  },
  {
    title: "B+ Trees",
    desc: "All data is stored in leaves and internal nodes store only keys — ideal for range queries.",
    path: "/tree/b-plus-tree",
  },
];

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {treeData.map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl shadow-md bg-[#1e293b] border border-[#334155] hover:border-[#6366f1] transition-all"
            >
              <TreePine className="h-8 w-8 text-[#6366f1] mb-4" />
              <h4 className="text-xl font-semibold mb-2 text-[#f1f5f9]">
                {item.title}
              </h4>
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

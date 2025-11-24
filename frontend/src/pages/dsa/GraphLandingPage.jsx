import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Network } from "lucide-react";

function GraphLandingPage() {
  const graphData = [
    {
      title: "Breadth-First Search (BFS)",
      desc: "A graph traversal algorithm that explores all neighbors at the present depth before moving deeper.",
      path: "/graph/bfs",
    },
    {
      title: "Depth-First Search (DFS)",
      desc: "A graph traversal algorithm that explores as far as possible along each branch before backtracking.",
      path: "/graph/dfs",
    },
    {
      title: "Topological Sort (DFS)",
      desc: "Orders vertices in a directed acyclic graph such that for every edge (u,v), u comes before v.",
      path: "/graph/topological-sort",
    },
    {
      title: "Connected Components",
      desc: "Identifies groups of vertices in a graph where each vertex is reachable from any other vertex in the group.",
      path: "/graph/ConnectedComponents",
    },
    {
      title: "Dijkstra's Shortest Path",
      desc: "Finds the shortest path from a source vertex to all other vertices in a weighted graph.",
      path: "/graph/dijkstra",
    },
   
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {graphData.map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl shadow-md bg-[#1e293b] border border-[#334155] hover:border-[#6366f1] transition-all"
            >
              <Network className="h-8 w-8 text-[#6366f1] mb-4" />
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

export default GraphLandingPage;
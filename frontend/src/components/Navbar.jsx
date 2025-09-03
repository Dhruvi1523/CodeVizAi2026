import React from 'react';
import { Code2, Github } from 'lucide-react';

function Navbar() {
  return (
    
      <nav className="bg-[#0f172a] px-6 py-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💻</span>
            <span className="text-xl font-bold">CodeVizAI</span>
          </div>

          {/* Nav Links */}
          <div className="flex space-x-6 text-sm font-medium">
            {/* <Link to="/" className="hover:text-blue-400">Home</Link> */}
            {/* <a href="#editor" className="hover:text-blue-400 transition">Code Editor</a>
            <a href="#visualizer" className="hover:text-blue-400 transition">DSA Visualizer</a>
            <a href="#complexity" className="hover:text-blue-400 transition">Complexity</a>
            <a href="#flowchart" className="hover:text-blue-400 transition">Flowchart</a>
            <a href="#explanation" className="hover:text-blue-400 transition">Explanation</a> */}
          </div>

          <div className="flex space-x-4">
        <Link to="/sign-in" className="px-3 py-1 rounded-md border border-gray-400 hover:bg-blue-500 hover:text-white">
          Sign In
        </Link>
        <Link to="/sign-up" className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700">
          Sign Up
        </Link>
      </div>
        </div>
      </nav>
  );
}

export default Navbar;

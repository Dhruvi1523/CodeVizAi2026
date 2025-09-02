import React from 'react';
import { Code2, Github } from 'lucide-react';

function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Code2 className="h-8 w-8 text-blue-500" />
          <h1 className="text-2xl font-bold text-white">CodVizAI</h1>
          <span className="text-gray-400 text-sm">DSA Visualizer</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

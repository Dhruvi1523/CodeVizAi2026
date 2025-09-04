import React from 'react';

// --- Correction 1: Added imports for icons ---
// Assuming icons are from the 'lucide-react' library, just like the previous file.
import { Github, FileText, Mail } from 'lucide-react';

// --- Correction 2: Removed unused imports ---
// Imports for 'Link', 'SignedIn', 'SignedOut', and 'UserButton' were removed
// as they were not being used in the component.

export default function Footer() {
  return (
    // Added font-sans for consistency
    <footer className="bg-[#0f172a] text-white border-t border-gray-800 px-6 py-8 font-sans">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-6 md:mb-0">
          <span className="text-3xl" role="img" aria-label="laptop emoji">💻</span>
          <span className="text-xl font-bold text-gray-100">CodeVizAI</span>
        </div>

        {/* Footer Links */}
        <div className="flex space-x-6">
          <a href="#github" className="flex items-center text-gray-400 hover:text-indigo-400 transition">
            <Github className="w-4 h-4 mr-2" /> GitHub
          </a>
          <a href="#docs" className="flex items-center text-gray-400 hover:text-indigo-400 transition">
            <FileText className="w-4 h-4 mr-2" /> Docs
          </a>
          <a href="#contact" className="flex items-center text-gray-400 hover:text-indigo-400 transition">
            <Mail className="w-4 h-4 mr-2" /> Contact
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-sm text-gray-500 mt-8 pt-6 border-t border-gray-800">
        {/* --- Correction 3: Made the year dynamic --- */}
        {/* This will automatically update the year. */}
        © {new Date().getFullYear()} CodVizAI. Built with modern web technologies.
      </div>
    </footer>
  );
}



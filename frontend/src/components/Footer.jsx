import React from 'react';
import { Github, FileText, Mail ,Code } from 'lucide-react';

export default function Footer() {
  return (
    // Use theme hex codes for background, text, and border
    <footer className="bg-[#0f172a] text-[#f1f5f9] border-t border-[#334155] px-6 py-8 font-sans">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-6 md:mb-0">
          <div className="w-8 h-8 bg-[#6366f1] rounded-full flex items-center justify-center">
            <Code size={18} className="text-[#f1f5f9]" />
          </div>
          {/* Use main foreground color for brand name */}
          <span className="text-xl font-bold text-[#f1f5f9]">CodeVizAI</span>
        </div>

        {/* Footer Links */}
        <div className="flex space-x-6">
          {/* Use muted foreground for default link color and primary for hover */}
          <a href="#github" className="flex items-center text-[#94a3b8] hover:text-[#6366f1] transition-colors">
            <Github className="w-4 h-4 mr-2" /> GitHub
          </a>
          <a href="#docs" className="flex items-center text-[#94a3b8] hover:text-[#6366f1] transition-colors">
            <FileText className="w-4 h-4 mr-2" /> Docs
          </a>
          <a href="#contact" className="flex items-center text-[#94a3b8] hover:text-[#6366f1] transition-colors">
            <Mail className="w-4 h-4 mr-2" /> Contact
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-sm text-[#64748b] mt-8 pt-6 border-t border-[#334155]">
        © {new Date().getFullYear()} CodVizAI. Built with modern web technologies.
      </div>
    </footer>
  );
}
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Code, BarChart3, GitBranch, Share2, MessageSquareText } from 'lucide-react';

// Define navigation links as an array for easy mapping
const navLinks = [
  { to: '/code', icon: <Code size={16} />, label: 'Code Editor' },
  { to: '/complexity', icon: <BarChart3 size={16} />, label: 'Complexity' },
  { to: '/dsa-visualizer', icon: <GitBranch size={16} />, label: 'DSA Visualizer' },
  { to: '/flowchart', icon: <Share2 size={16} />, label: 'Flowchart' },
  { to: '/explanation', icon: <MessageSquareText size={16} />, label: 'Explanation' },
];

export default function Navbar() {
  // Define styles for active and inactive links using hex codes
  const linkBaseStyle = "flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors";
  const activeLinkStyle = "bg-[#334155] text-[#f1f5f9]"; // --secondary, --foreground
  const inactiveLinkStyle = "text-[#94a3b8] hover:bg-[#334155] hover:text-[#f1f5f9]"; // --muted-foreground, hover:--muted, hover:--foreground

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-[#1e293b] border-b border-[#334155]">
      {/* Left Section: Logo and Brand */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#6366f1] rounded-full flex items-center justify-center">
            <Code size={18} className="text-[#f1f5f9]" />
          </div>
          <span className="text-xl font-bold text-[#f1f5f9]">CodVizAI</span>
        </Link>
      </div>

      {/* Middle Section: Navigation Links */}
      <div className="hidden md:flex items-center gap-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `${linkBaseStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
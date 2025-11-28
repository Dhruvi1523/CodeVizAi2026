import React from 'react';
import { Link } from 'react-router-dom';
import { Hash, Zap, CornerRightDown, CornerRightUp, RefreshCw, Layers, ArrowLeft } from 'lucide-react';

const HashingHome = () => {
  const hashingTypes = [
    {
      title: "Simple Hashing (Hash Table)",
      description: "The core concept of mapping keys to array indices using a hash function, aiming for O(1) average time complexity.",
      icon: <Hash className="w-8 h-8"/>,
      category: "Basic Hashing",
      path: "/hashing/simple"
    },
    {
      title: "Separate Chaining",
      description: "A technique to resolve collisions by storing a linked list (or another structure) of keys at each bucket index.",
      icon: <Layers className="w-8 h-8"/>,
      category: "Collision Resolution Techniques",
      path: "/hashing/chaining"
    },
    {
      title: "Linear Probing",
      description: "An open addressing method that resolves collisions by sequentially searching for the next available empty slot in the array.",
      icon: <CornerRightDown className="w-8 h-8"/>,
      category: "Collision Resolution Techniques",
      path: "/hashing/linear-probing"
    },
    {
      title: "Quadratic Probing",
      description: "An open addressing method using a quadratic increment sequence (i^2) to find the next available slot, reducing clustering compared to linear probing.",
      icon: <CornerRightUp className="w-8 h-8"/>,
      category: "Collision Resolution Techniques",
      path: "/hashing/quadratic-probing"
    },
    {
      title: "Double Hashing",
      description: "An open addressing method that uses a second hash function to calculate the step size for collision resolution, offering better distribution.",
      icon: <RefreshCw className="w-8 h-8"/>,
      category: "Collision Resolution Techniques",
      path: "/hashing/double-hashing"
    },
  ];

  // Separate types into categories
  const basicHashing = hashingTypes.filter(hash => hash.category === "Basic Hashing");
  const collisionResolution = hashingTypes.filter(hash => hash.category === "Collision Resolution Techniques");

  const ListCard = ({ title, description, icon, path }) => (
    <Link 
      to={path} 
      className="flex flex-col p-6 bg-[#1e293b] rounded-xl border border-transparent hover:border-violet-500 hover:shadow-lg transition-all duration-200 group"
    >
      <div className="text-violet-400 mb-3 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      
      <p className="text-gray-400 text-sm flex-grow leading-relaxed">{description}</p>
      
      <div className="mt-4 text-violet-400 font-medium text-sm hover:underline flex items-center gap-1">
        Visualize <span>→</span>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8 relative font-sans">
      
      {/* --- BACK BUTTON --- */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          to="/dsa-visualizer" 
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1e293b] border border-[#334155] hover:border-violet-500 text-[#94a3b8] hover:text-white transition-all shadow-md group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto pt-12 md:pt-4"> 
        
        {/* Main Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500 mb-4">
            Hashing Algorithms
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore the fundamentals of Hash Tables, Hash Functions, and various strategies for handling collisions.
          </p>
        </div>

        {/* --- Basic Hashing Section --- */}
        <div className="mb-16">
            <h2 className="text-xl font-bold text-white mb-6 border-l-4 border-violet-500 pl-4">
                Basic Concepts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {basicHashing.map((hash) => (
                <ListCard key={hash.title} {...hash} />
            ))}
            </div>
        </div>

        {/* --- Collision Resolution Techniques Section --- */}
        <div>
            <h2 className="text-xl font-bold text-white mb-6 border-l-4 border-violet-500 pl-4">
                Collision Resolution Techniques
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collisionResolution.map((hash) => (
                <ListCard key={hash.title} {...hash} />
            ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default HashingHome;
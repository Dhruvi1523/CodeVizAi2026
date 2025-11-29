import React from 'react';
import { algorithms } from '../../data/algorithms';
import { Link } from 'react-router-dom';
import { FaSort, FaSearch, FaQuestion } from 'react-icons/fa';
import Navbar from "../Navbar.jsx"

const AlgorithmSelector = () => {
  const renderIcon = (category) => {
    switch (category) {
      case 'sorting':
        return <FaSort className="h-8 w-8 text-[#6366f1] mb-4" />;
      case 'searching':
        return <FaSearch className="h-8 w-8 text-[#10b981] mb-4" />;
      default:
        return <FaQuestion className="h-8 w-8 text-gray-400 mb-4" />;
    }
  };

  const renderBadge = (category) => {
    let color = '';
    switch (category) {
      case 'sorting':
        color = 'bg-blue-500';
        break;
      case 'searching':
        color = 'bg-green-500';
        break;
      default:
        color = 'bg-gray-500';
    }
    return (
      <span
        className={`text-xs font-semibold ${color} text-white px-2 py-1 rounded-full absolute top-4 right-4`}
      >
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9] px-6 py-6">
      <Navbar/>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Select an Algorithm</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {algorithms.map((algo) => (
            <div
              key={algo.id}
              className="relative p-6 rounded-2xl shadow-md bg-[#1e293b] border border-[#334155] hover:border-[#6366f1] transition-all cursor-pointer flex flex-col justify-between"
            >
              {renderBadge(algo.category)}
              {renderIcon(algo.category)}
              <h3 className="text-xl font-semibold mb-2 text-[#f1f5f9]">{algo.name}</h3>
              <p className="text-[#94a3b8] text-sm mb-4 flex-grow">{algo.description}</p>
              <Link
                to={algo.path}
                className="inline-block text-sm font-medium text-white bg-[#6366f1] hover:bg-[#4f46e5] px-4 py-2 rounded-lg text-center transition-colors"
              >
                Visualize
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlgorithmSelector;

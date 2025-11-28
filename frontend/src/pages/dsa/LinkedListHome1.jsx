/* eslint-disable no-irregular-whitespace */
import React from 'react';
import { Link } from 'react-router-dom';
import { List, GitMerge, RotateCw, Share2, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from "framer-motion";

const LinkedListHome = () => {
  const listTypes = [
    {
      title: "Singly Linked List",
      description: "A linear collection where each node points to the next. Supports fast insertion at head and forward traversal only.",
      icon: <List className="w-8 h-8"/>,
      category: "Basic Implementations",
      path: "/linkedlist/singly"
    },
    {
      title: "Doubly Linked List",
      description: "Nodes contain pointers to both the next and previous nodes, enabling efficient bidirectional traversal.",
      icon: <GitMerge className="w-8 h-8"/>,
      category: "Basic Implementations",
      path: "/linkedlist/doubly"
    },
    {
      title: "Circular Singly List",
      description: "The last node points back to the first node, creating a loop for continuous forward traversal without a null end.",
      icon: <RotateCw className="w-8 h-8"/>,
      category: "Circular Variations",
      path: "/linkedlist/circular-singly"
    },
    {
      title: "Circular Doubly List",
      description: "A bidirectional list where the head and tail nodes link to each other, closing the loop on both ends.",
      icon: <Share2 className="w-8 h-8"/>,
      category: "Circular Variations",
      path: "/linkedlist/circular-doubly"
    },
  ];

  const basicLists = listTypes.filter(list => list.category === "Basic Implementations");
  const circularLists = listTypes.filter(list => list.category === "Circular Variations");

  const ListCard = ({ title, description, icon, path }) => (
    <Link 
      to={path} 
      className="flex flex-col p-6 bg-[#1e293b] rounded-xl border border-transparent hover:border-blue-500 hover:shadow-lg transition-all duration-200 group"
    >
      <div className="text-blue-400 mb-3 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      
      <p className="text-gray-400 text-sm flex-grow">{description}</p>
      
      <div className="mt-4 text-blue-400 font-medium text-sm hover:underline flex items-center gap-1">
        Visualize <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8 relative font-sans">
      
      {/* --- BACK BUTTON --- */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          to="/dsa-visualizer" 
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1e293b] border border-[#334155] hover:border-blue-500 text-[#94a3b8] hover:text-white transition-all shadow-md group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto pt-12 md:pt-4"> 
        
        {/* Main Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#9333ea] mb-2">
            Linked List Data Structure Visualizer
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Select a Linked List type to explore node structure, memory management, and dynamic operations.
          </p>
        </div>

        {/* Basic Implementations Section */}
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-blue-500 pl-4">
                Basic Implementations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {basicLists.map((list) => (
                    <ListCard key={list.title} {...list} />
                ))}
            </div>
        </div>

        {/* Circular Variations Section */}
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-blue-500 pl-4">
                Circular Variations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {circularLists.map((list) => (
                    <ListCard key={list.title} {...list} />
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default LinkedListHome;
import React from 'react';
import { Link } from 'react-router-dom';
import { Shuffle, RotateCw, ArrowLeftRight, TrendingUp, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from "framer-motion";

export default function QueueHome() {
  
  // Data for Section 1
  const basicQueues = [
    {
      id: 'simple',
      title: 'Simple Queue',
      desc: 'The fundamental First-In, First-Out (FIFO) structure, typically implemented using arrays or linked lists.',
      path: '/queue/simple',
      icon: Shuffle,
    },
    {
      id: 'circular',
      title: 'Circular Queue',
      desc: 'A queue where the last element is connected to the first, efficiently utilizing memory in a fixed-size array.',
      path: '/queue/circular',
      icon: RotateCw,
    },
  ];

  // Data for Section 2
  const specializedQueues = [
    {
      id: 'deque',
      title: 'Dequeue (Double-Ended Queue)',
      desc: 'A queue that allows insertions and deletions to be performed from both the front and the rear ends (LIFO and FIFO capability).',
      path: '/queue/dequeue',
      icon: ArrowLeftRight,
    },
    {
      id: 'priority',
      title: 'Priority Queue',
      desc: 'Elements are served based on priority, not arrival time. Usually implemented using a Max or Min Heap.',
      path: '/queue/priority',
      icon: TrendingUp,
    },
  ];

  // Card Component
  const QueueCard = ({ item }) => (
    <Link 
      to={item.path}
      className="group flex flex-col h-full bg-[#1e293b] border border-[#334155]/50 rounded-xl p-6 hover:border-[#6366f1] hover:shadow-lg hover:shadow-[#6366f1]/10 transition-all duration-300"
    >
      <div className="mb-4">
        <item.icon className="w-8 h-8 text-[#6366f1] group-hover:scale-110 transition-transform duration-300" />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
        {item.title}
      </h3>
      
      <p className="text-[#94a3b8] text-sm leading-relaxed mb-6 flex-grow">
        {item.desc}
      </p>

      <div className="flex items-center text-[#6366f1] font-medium text-sm group-hover:translate-x-1 transition-transform duration-300">
        Visualize <ArrowRight className="ml-1 w-4 h-4" />
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9] p-6 lg:p-12 font-sans relative">
      
      {/* --- NEW BACK BUTTON --- */}
      {/* Positioned absolutely in the top-left corner */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          to="/dsa-visualizer" 
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1e293b] border border-[#334155] hover:border-[#6366f1] text-[#94a3b8] hover:text-white transition-all shadow-md group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm"></span>
        </Link>
      </div>

      <div className="flex flex-col justify-center min-h-[80vh]">
        <div className="max-w-6xl mx-auto w-full pt-12 md:pt-0"> {/* Padding top added for mobile spacing */}
          
          {/* Header Section */}
          <div className="text-center mb-16 space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-extrabold tracking-tight mt-8 md:mt-0"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] to-[#a855f7]">
                Queue Data Structure Visualizer
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-[#94a3b8] text-lg max-w-2xl mx-auto"
            >
              Select a Queue type to explore its operations (Enqueue, Dequeue, Peek) and implementation details.
            </motion.p>
          </div>

          {/* SECTION 1: Basic Queue Implementations */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-xl font-bold text-[#6366f1] mb-6 border-b border-[#334155] pb-4">
              Basic Queue Implementations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {basicQueues.map((q) => <QueueCard key={q.id} item={q} />)}
            </div>
          </motion.div>

          {/* SECTION 2: Specialized Queue Types */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-[#6366f1] mb-6 border-b border-[#334155] pb-4">
              Specialized Queue Types
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {specializedQueues.map((q) => <QueueCard key={q.id} item={q} />)}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
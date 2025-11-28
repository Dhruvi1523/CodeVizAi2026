import React from 'react';

import { Code2, BarChart3, GitBranch, Share2 } from 'lucide-react';
import { Link } from "react-router-dom";

export default function FeaturesSection() {

const features = [
  {
    title: "Code Runner",
    path: "/code",
    description: "Write, run, and debug code in multiple programming languages...",
    icon: <Code2 className="w-6 h-6" />,
    color: "bg-blue-600",
  },
  {
    title: "Complexity Analyzer",
    path: "/code",
    description: "Analyze time and space complexity...",
    icon: <BarChart3 className="w-6 h-6" />,
    color: "bg-green-600",
  },
  {
    title: "DSA Visualizer",
    path: "/dsa-visualizer",
    description: "Visualize data structures and algorithms...",
    icon: <GitBranch className="w-6 h-6" />,
    color: "bg-purple-600",
  },
  {
    title: "Flowchart Generator",
    path: "/flow-chart-generator",
    description: "Generate beautiful flowcharts...",
    icon: <Share2 className="w-6 h-6" />,
    color: "bg-orange-600",
  },
];


  return (
    <div className="h-screen bg-[#192437] text-white py-20  font-sans">
      {/* Section Title */}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold">
          Everything You Need to Understand Code
        </h2>
        <p className="mt-4 text-lg text-gray-400">
          Powerful tools to analyze, visualize, and understand your code better
          than ever before.
        </p>
      </div>

      {/* Features Grid */}
      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-[#1e293b] rounded-xl p-6 shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-2 transition-all duration-300 border border-gray-700"
          >
            {/* --- Correction 3: Fixed className syntax --- */}
            {/* The className string now correctly uses a template literal (backticks) */}
            {/* to dynamically include the feature.color variable. */}
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-lg ${feature.color} text-white mb-4`}
            >
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-100">{feature.title}</h3>
            <p className="mt-2 text-gray-400 text-sm leading-relaxed">
              {feature.description}
            </p>
            <Link
              to={feature.path}
              className="mt-4 inline-block text-sm text-indigo-400 hover:text-indigo-300 font-medium group"
            >
              Learn more{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                &rarr;
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}


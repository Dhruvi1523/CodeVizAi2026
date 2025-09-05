import { useState } from "react";
import { Link } from "react-router-dom";
import { DP_ALGORITHMS } from "../../data/dp_algorithms";
import ProblemDetailModal from "../../components/dp/ProblemDetailModal";
import { ChevronLeft } from "lucide-react";

export default function DynamicProgramingPage() {
  const [detailsModalAlgoId, setDetailsModalAlgoId] = useState(null);

  return (
    <>
      <div className="p-6 bg-[#0f172a] min-h-screen text-[#f1f5f9]">
        {/* --- Hero Section --- */}
        <div className="relative text-center pt-12 pb-16">
  {/* Back Link with Absolute Positioning */}
  <Link 
    to="/dsa-visualizer"
    className="
      absolute left-0 top-1/3 -translate-y-1/2 
      p-2 text-[#94a3b8] 
      hover:bg-[#334155] hover:text-[#f1f5f9] 
      rounded-full transition-colors
    "
    title="Back to Visualizers"
  >
    <ChevronLeft size={28} />
  </Link>
  
  {/* Centered Title and Subtitle */}
  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
    <span className="bg-gradient-to-r from-[#6366f1] to-[#14b8a6] bg-clip-text text-transparent">
      Dynamic Programming
    </span>
    {" "}Visualizer
  </h1>
  <p className="text-[#94a3b8] mt-4 max-w-2xl mx-auto">
    Select an algorithm to see a step-by-step visualization of how it
    works, using both bottom-up and top-down approaches.
  </p>
</div>

        {/* --- Algorithm Card Grid --- */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(DP_ALGORITHMS).map(([id, algo]) => (
            <div
              key={id}
              className="bg-[#1e293b] rounded-xl border border-[#334155] p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#6366f1]/10"
            >
              {/* Icon and Title */}
              <div className="flex items-center gap-4">
                <div className="bg-[rgba(99,102,241,0.1)] p-2 rounded-lg">
                  <algo.icon className="h-8 w-8 text-[#6366f1]" />
                </div>
                <h2 className="text-xl font-bold text-[#f1f5f9]">
                  {algo.name}
                </h2>
              </div>

              <p className="text-[#94a3b8] mt-4 flex-grow text-sm">
                {algo.problem}
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setDetailsModalAlgoId(id)}
                  className="flex-1 text-center bg-[#334155] hover:bg-[#475569] text-[#f1f5f9] font-bold py-2 px-4 rounded-md transition-colors"
                >
                  Problem
                </button>
                <Link
                  to={`/dynamic-programming/${id}`}
                  className="flex-1 text-center bg-[#6366f1] hover:opacity-90 text-[#f1f5f9] font-bold py-2 px-4 rounded-md transition-colors"
                >
                  Visualize
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Modal Rendering --- */}
      {detailsModalAlgoId && (
        <ProblemDetailModal
          algoId={detailsModalAlgoId}
          onClose={() => setDetailsModalAlgoId(null)}
        />
      )}
    </>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DP_ALGORITHMS } from '../../data/dp_algorithms';
import ProblemDetailModal from '../../components/dp/ProblemDetailModal';

export default function DynamicProgramingPage() {
  const [detailsModalAlgoId, setDetailsModalAlgoId] = useState(null);

  return (
    <>
      <div className="p-6 bg-gray-950 min-h-screen text-white">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">Dynamic Programming Visualizer</h1>
          <p className="text-gray-400 mt-2">Select an algorithm to begin</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(DP_ALGORITHMS).map(([id, algo]) => (
            <div key={id} className="bg-gray-800 rounded-lg p-6 flex flex-col hover:ring-2 ring-blue-500 transition-all">
              <h2 className="text-xl font-bold text-blue-400">{algo.name}</h2>
              <p className="text-gray-300 mt-2 flex-grow">{algo.problem.substring(0, 100)}...</p>
              <div className="mt-4 flex gap-2">
                <button
                    onClick={() => setDetailsModalAlgoId(id)}
                    className="flex-1 text-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                    Problem
                </button>
                <Link
                  to={`/dynamic-programming/${id}`}
                  className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Visualize
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      {detailsModalAlgoId && (
        <ProblemDetailModal
          algoId={detailsModalAlgoId}
          onClose={() => setDetailsModalAlgoId(null)}
        />
      )}
    </>
  );
}
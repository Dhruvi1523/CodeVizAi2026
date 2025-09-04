import { DP_ALGORITHMS } from "../../data/dp_algorithms";

export function InlineCode({ text }) {
  if (!text) return null;

  const parts = text.split(/(`[^`]+`)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={index}
              className="bg-gray-700 text-yellow-400 font-mono font-semibold px-2 py-1 rounded-md text-sm"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      })}
    </>
  );
}

export default function ProblemDetailModal({ algoId, onClose }) {
  const info = DP_ALGORITHMS[algoId];

  if (!info) return null;

  return (
    // Backdrop with a subtle fade-in animation
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 animate-fade-in"
    >
      {/* Modal Container with a scale-up animation */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-600 animate-scale-up"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-2xl font-bold text-blue-400">{info.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-transparent hover:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Content Body with custom styling */}
        <div className="p-6 space-y-6 overflow-auto">
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
              Problem Statement
            </h3>
            <p className="text-gray-300 leading-relaxed">{info.problem}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Logic</h3>
            {/* --- FIX IS HERE --- */}
            {/* Replace the simple <p> tag with the new component */}
            <p className="text-gray-300 leading-relaxed">
              <InlineCode text={info.logic} />
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
              Complexity
            </h3>
            <div className="flex gap-6 text-gray-300 bg-gray-900/50 p-3 rounded-md border border-gray-700">
              <p>
                <strong>Time:</strong>{" "}
                <code className="text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                  {info.complexity.time}
                </code>
              </p>
              <p>
                <strong>Space:</strong>{" "}
                <code className="text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                  {info.complexity.space}
                </code>
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
              Example
            </h3>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 text-sm font-mono">
              <div className="flex items-start">
                <strong className="text-gray-400 mr-2 w-28 flex-shrink-0">
                  Input:
                </strong>
                <code className="text-green-400">{info.example.input}</code>
              </div>
              <div className="flex items-start mt-2">
                <strong className="text-gray-400 mr-2 w-28 flex-shrink-0">
                  Output:
                </strong>
                <code className="text-green-400">{info.example.output}</code>
              </div>
              <div className="flex items-start mt-2">
                <strong className="text-gray-400 mr-2 w-28 flex-shrink-0">
                  Explanation:
                </strong>
                <span className="text-gray-400">
                  {info.example.explanation}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

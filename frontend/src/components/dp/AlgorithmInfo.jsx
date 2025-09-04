import { DP_ALGORITHMS } from '../../data/dp_algorithms';

export default function AlgorithmInfo({ algoId }) {
  const info = DP_ALGORITHMS[algoId];

  if (!info) return null;

  return (
    <details className="bg-gray-800 rounded-lg p-4 cursor-pointer">
      <summary className="font-semibold text-lg text-gray-300">
        Problem Description & Logic
      </summary>
      <div className="mt-4 prose prose-invert max-w-none prose-p:text-gray-300 prose-code:text-yellow-300">
        <p><strong>Problem:</strong> {info.problem}</p>
        <p><strong>Logic:</strong> {info.logic}</p>
        <p>
          <strong>Time Complexity:</strong> <code>{info.complexity.time}</code> | <strong>Space Complexity:</strong> <code>{info.complexity.space}</code>
        </p>
      </div>
    </details>
  );
}
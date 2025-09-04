import { Link } from "react-router-dom";
import { DP_ALGORITHMS } from "../../data/dp_algorithms";

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
    </svg>
);

export default function Header({ algoId, onToggleSidebar }) {
  const algoName = DP_ALGORITHMS[algoId]?.name || "DP Visualizer";

  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-gray-300 bg-gray-900 hover:bg-gray-700 rounded-lg transition-colors"
          title="Toggle Sidebar"
        >
          <MenuIcon />
        </button>
        <Link to="/" className="text-blue-400 hover:underline">
          &larr; Back to Algorithms
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-200">{algoName}</h1>
    </header>
  );
}
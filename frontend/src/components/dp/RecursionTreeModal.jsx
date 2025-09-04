import RecursionTree from './RecursionTree';
import MemoTable from './MemoTable';

export default function RecursionTreeModal({ treeData, memoData, onClose }) {
  return (
    // Backdrop
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
    >
      {/* Modal Content */}
      <div
        onClick={(e) => e.stopPropagation()} // Prevents modal from closing when clicking inside
        className="bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Top-Down Recursion Visualization</h2>
          <button
            onClick={onClose}
            className="text-white bg-gray-700 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-auto">
          <RecursionTree data={treeData} />
          <MemoTable memo={memoData} />
        </div>
      </div>
    </div>
  );
}
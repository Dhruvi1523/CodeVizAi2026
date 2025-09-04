import { DP_ALGORITHMS } from "../../data/dp_algorithms";

export default function Sidebar({ algoId, inputs, onInputsChange, onVisualize, mode, onModeChange, isTopDownDisabled, isLoading }) {
  const algoInfo = DP_ALGORITHMS[algoId];

  const handleInputChange = (id, value) => {
    onInputsChange((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col gap-6 h-full border border-gray-700">
      <div>
        {/* Title now shows the algorithm name */}
        <h2 className="text-xl font-bold text-gray-200 mb-4">{algoInfo?.name} Settings</h2>
        
        <div className="space-y-4">
          {algoInfo?.inputs.map((input) => (
            <div key={input.id}>
              <label htmlFor={input.id} className="text-sm font-medium text-gray-400">{input.label}</label>
              <input
                type={input.type}
                id={input.id}
                value={inputs[input.id] || ""}
                onChange={(e) => handleInputChange(input.id, e.target.value)}
                className="mt-1 w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-md font-medium text-gray-400 mb-2">Approach</h3>
        <div className="flex flex-col gap-2">
            <button
              onClick={() => onModeChange('bottom-up')}
              className={`px-4 py-2 text-left rounded font-bold transition-colors ${mode === 'bottom-up' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
            >Bottom-Up</button>
            <button
              onClick={() => onModeChange('top-down')}
              className={`px-4 py-2 text-left rounded font-bold transition-colors ${mode === 'top-down' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
              disabled={isTopDownDisabled}
            >Top-Down</button>
        </div>
      </div>

      <div className="mt-auto">
        <button
          onClick={onVisualize}
          className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded font-bold"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Visualize"}
        </button>
      </div>
    </div>
  );
}
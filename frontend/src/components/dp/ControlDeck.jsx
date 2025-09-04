import { DP_ALGORITHMS } from "../../data/dp_algorithms";
import { parseInputs } from "../../utils/input_parser";

const AppMode = { BOTTOM_UP: "bottom-up", TOP_DOWN: "top-down" };

export default function ControlDeck({
  algoId,
  inputs,
  onInputsChange,
  onVisualize,
  mode,
  onModeChange,
  isTopDownDisabled,
  isPlaying,
  isLoading,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onSpeedChange,
}) {
  const algoInfo = DP_ALGORITHMS[algoId];

  const handleInputChange = (id, value) => {
    onInputsChange((prev) => ({ ...prev, [id]: value }));
  };

  const handleVisualizeClick = () => {
    const parsed = parseInputs(inputs, algoId);
    onVisualize(parsed);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4 border border-gray-700">
      {/* Top Row: Inputs */}
      <div className="flex flex-wrap items-end justify-center gap-x-6 gap-y-4">
        {algoInfo?.inputs.map((input) => (
          <div key={input.id}>
            <label htmlFor={input.id} className="text-sm font-medium text-gray-400">
              {input.label}
            </label>
            <input
              type={input.type}
              id={input.id}
              value={inputs[input.id] || ""}
              onChange={(e) => handleInputChange(input.id, e.target.value)}
              className="mt-1 w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        ))}
        <button
          onClick={handleVisualizeClick}
          className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-md font-bold"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Visualize"}
        </button>
      </div>

      <hr className="border-gray-600" />

      {/* Bottom Row: Mode & Playback */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Mode Selector */}
        <div className="flex gap-2">
            <button
              onClick={() => onModeChange(AppMode.BOTTOM_UP)}
              className={`px-4 py-2 rounded font-bold transition-colors ${mode === AppMode.BOTTOM_UP ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
            >Bottom-Up</button>
            <button
              onClick={() => onModeChange(AppMode.TOP_DOWN)}
              className={`px-4 py-2 rounded font-bold transition-colors ${mode === AppMode.TOP_DOWN ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
              disabled={isTopDownDisabled}
            >Top-Down</button>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-4">
            <button onClick={onPrev} className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50" disabled={isLoading}>Prev</button>
            <button onClick={isPlaying ? onPause : onPlay} className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded w-20 disabled:opacity-50" disabled={isLoading}>
                {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button onClick={onNext} className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50" disabled={isLoading}>Next</button>
            <div className="flex items-center gap-2">
              <label htmlFor="speed" className="text-sm">Speed</label>
              <input
                type="range" id="speed" min="100" max="1000" defaultValue="500"
                onChange={(e) => onSpeedChange(Number(e.target.value))}
                className="w-24" disabled={isLoading}
              />
            </div>
        </div>
      </div>
    </div>
  );
}
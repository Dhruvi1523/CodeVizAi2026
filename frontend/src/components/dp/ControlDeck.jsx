import { DP_ALGORITHMS } from '../../data/dp_algorithms';
import { parseInputs } from '../../utils/input_parser';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

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
    <div className="bg-[#1e293b] rounded-xl p-4 space-y-4 border border-[#334155]">
      {/* Top Row: Inputs */}
      <div className="flex flex-wrap items-end justify-center gap-x-6 gap-y-4">
        {algoInfo?.inputs.map((input) => (
          <div key={input.id}>
            <label htmlFor={input.id} className="text-sm font-medium text-[#94a3b8]">
              {input.label}
            </label>
            <input
              type={input.type}
              id={input.id}
              value={inputs[input.id] || ""}
              onChange={(e) => handleInputChange(input.id, e.target.value)}
              className="mt-1 w-full bg-[#0f172a] text-[#f1f5f9] px-3 py-2 rounded-md border border-[#334155] focus:ring-2 focus:ring-[#6366f1] focus:outline-none"
            />
          </div>
        ))}
        <button
          onClick={handleVisualizeClick}
          className="bg-[#6366f1] hover:opacity-90 h-10 px-6 rounded-md font-bold text-[#f1f5f9]"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Visualize"}
        </button>
      </div>

      <hr className="border-[#334155]" />

      {/* Bottom Row: Mode & Playback */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Mode Selector */}
        <div className="flex gap-2">
            <button
              onClick={() => onModeChange(AppMode.BOTTOM_UP)}
              className={`px-4 py-2 rounded-md font-bold transition-colors ${mode === AppMode.BOTTOM_UP ? 'bg-[#6366f1] text-[#f1f5f9]' : 'bg-[#334155] hover:bg-opacity-80'}`}
            >Bottom-Up</button>
            <button
              onClick={() => onModeChange(AppMode.TOP_DOWN)}
              className={`px-4 py-2 rounded-md font-bold transition-colors ${mode === AppMode.TOP_DOWN ? 'bg-[#8b5cf6] text-[#f1f5f9]' : 'bg-[#334155] hover:bg-opacity-80'}`}
              disabled={isTopDownDisabled}
            >Top-Down</button>
        </div>

        {/* --- MODIFIED: Playback Controls --- */}
        <div className="flex items-center gap-2">
            <button 
                onClick={onPrev} 
                title="Previous Step" 
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#334155] hover:bg-opacity-80 rounded-md disabled:opacity-50 text-sm font-semibold" 
                disabled={isLoading}
            >
                <SkipBack size={16} className="text-[#f1f5f9]" />
                <span>Prev</span>
            </button>
            <button 
                onClick={isPlaying ? onPause : onPlay} 
                title={isPlaying ? "Pause" : "Play"} 
                className={`p-3 rounded-full w-12 h-12 flex items-center justify-center disabled:opacity-50 ${isPlaying ? 'bg-[#f59e0b] hover:opacity-90' : 'bg-[#14b8a6] hover:opacity-90'}`} 
                disabled={isLoading}
            >
                {isPlaying ? <Pause size={20} className="text-[#f1f5f9]" /> : <Play size={20} className="text-[#f1f5f9] ml-1" />}
            </button>
            <button 
                onClick={onNext} 
                title="Next Step" 
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#334155] hover:bg-opacity-80 rounded-md disabled:opacity-50 text-sm font-semibold" 
                disabled={isLoading}
            >
                <span>Next</span>
                <SkipForward size={16} className="text-[#f1f5f9]" />
            </button>
            <div className="flex items-center gap-2 ml-4">
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
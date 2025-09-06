import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RefreshCw } from 'lucide-react';

export default function PlaybackControls({
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onReset,
  onSpeedChange,
  speed,
  isLoading,
  currentStep,
  totalSteps,
  trace
}) {
  return (
    <div className="flex-shrink-0 flex items-center justify-between gap-4 p-2 bg-[#0f172a] rounded-lg border border-[#334155]">
      {/* Left side: Step Info */}
      <div className="font-mono text-sm text-[#94a3b8] w-48">
        Step {currentStep + 1} / {totalSteps} (Line: {totalSteps > 0 ? trace[currentStep]?.line || 'N/A' : 'N/A'})
      </div>
      
      {/* Center: Playback Buttons */}
      <div className="flex items-center gap-2">
        <button onClick={onReset} title="Reset" className="p-2 bg-[#334155] hover:bg-opacity-80 rounded-full disabled:opacity-50" disabled={isLoading}><RefreshCw size={18} /></button>
        <button onClick={onPrev} title="Previous Step" className="p-2 bg-[#334155] hover:bg-opacity-80 rounded-full disabled:opacity-50" disabled={isLoading}><SkipBack size={18} /></button>
        <button onClick={isPlaying ? onPause : onPlay} title={isPlaying ? "Pause" : "Play"} className={`p-3 rounded-full w-12 h-12 flex items-center justify-center disabled:opacity-50 ${isPlaying ? 'bg-[#f59e0b] hover:opacity-90' : 'bg-[#14b8a6] hover:opacity-90'}`} disabled={isLoading}>
            {isPlaying ? <Pause size={20} className="text-[#f1f5f9]" /> : <Play size={20} className="text-[#f1f5f9] ml-1" />}
        </button>
        <button onClick={onNext} title="Next Step" className="p-2 bg-[#334155] hover:bg-opacity-80 rounded-full disabled:opacity-50" disabled={isLoading}><SkipForward size={18} /></button>
      </div>

      {/* Right side: Speed Control */}
      <div className="flex items-center gap-2 w-48 justify-end">
        <label htmlFor="speed" className="text-sm">Speed</label>
        <input type="range" id="speed" min="100" max="1500" value={speed} onChange={e => onSpeedChange(Number(e.target.value))} className="w-24" />
      </div>
    </div>
  );
}
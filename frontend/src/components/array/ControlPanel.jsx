// ControlPanel.jsx (Compact, Horizontal)
import React from 'react';
import { Play, Pause, Square, SkipForward, Shuffle } from 'lucide-react';

const ControlPanel = ({
  isPlaying,
  onPlay,
  onPause,
  onStep,
  onReset,
  onGenerateArray,
  speed,
  onSpeedChange,
  arraySize,
  onArraySizeChange,
  canStep,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg py-4 px-3 flex items-center justify-between gap-4">
      {/* Buttons */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={!canStep && !isPlaying}
          className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded-lg"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="text-sm">{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        <button
          onClick={onStep}
          disabled={!canStep || isPlaying}
          className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded-lg"
        >
          <SkipForward className="h-4 w-4" />
          <span className="text-sm">Step</span>
        </button>

        <button
          onClick={onReset}
          className="flex items-center space-x-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-lg"
        >
          <Square className="h-4 w-4" />
          <span className="text-sm">Reset</span>
        </button>

        <button
          onClick={onGenerateArray}
          className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg"
        >
          <Shuffle className="h-4 w-4" />
          <span className="text-sm">Random</span>
        </button>
      </div>

      {/* Sliders */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex flex-col gap-2 text-gray-300 text-sm">
          <label>Speed: {speed}ms</label>
          <input
            type="range"
            min="50"
            max="2000"
            step="50"
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="w-32 h-2 bg-gray-700 rounded-lg cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-2 text-gray-300 text-sm">
          <label>Array Size: {arraySize}</label>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={arraySize}
            onChange={(e) => onArraySizeChange(Number(e.target.value))}
            className="w-32 h-2 bg-gray-700 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;

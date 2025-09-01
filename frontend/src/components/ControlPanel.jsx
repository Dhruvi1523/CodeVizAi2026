import React from 'react';
import { Play, Pause, Square, SkipForward, RefreshCw, Shuffle } from 'lucide-react';

interface ControlPanelProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onGenerateArray: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  arraySize: number;
  onArraySizeChange: (size: number) => void;
  canStep: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
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
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={!canStep && !isPlaying}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        <button
          onClick={onStep}
          disabled={!canStep || isPlaying}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <SkipForward className="h-4 w-4" />
          <span>Step</span>
        </button>

        <button
          onClick={onReset}
          className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <Square className="h-4 w-4" />
          <span>Reset</span>
        </button>

        <button
          onClick={onGenerateArray}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <Shuffle className="h-4 w-4" />
          <span>Random Array</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="speed" className="block text-sm font-medium text-gray-300 mb-2">
            Speed: {speed}ms
          </label>
          <input
            type="range"
            id="speed"
            min="50"
            max="2000"
            step="50"
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-300 mb-2">
            Random Array Size: {arraySize}
          </label>
          <input
            type="range"
            id="size"
            min="5"
            max="100"
            step="5"
            value={arraySize}
            onChange={(e) => onArraySizeChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
// In src/components/visualizers/PlaybackControls.jsx

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const ControlButton = ({ onClick, disabled, children, title }) => (
    <motion.button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className="p-2 rounded-full bg-slate-700 text-slate-300 transition-colors enabled:hover:bg-indigo-600 enabled:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        whileTap={{ scale: 0.9 }}
    >
        {children}
    </motion.button>
);

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
    onScrub // Our new prop!
}) {
    const isAtStart = currentStep === 0;
    const isAtEnd = currentStep >= totalSteps - 1;

    return (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl space-y-4">
            {/* --- Top Row: Main Playback Buttons --- */}
            <div className="flex items-center justify-center gap-4">
                <ControlButton onClick={onReset} disabled={isLoading || isAtStart} title="Reset">
                    <RotateCcw size={20} />
                </ControlButton>
                <ControlButton onClick={onPrev} disabled={isLoading || isAtStart} title="Previous Step">
                    <SkipBack size={20} />
                </ControlButton>
                
                <ControlButton onClick={isPlaying ? onPause : onPlay} disabled={isLoading || isAtEnd} title={isPlaying ? "Pause" : "Play"}>
                    {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current" />}
                </ControlButton>
                
                <ControlButton onClick={onNext} disabled={isLoading || isAtEnd} title="Next Step">
                    <SkipForward size={20} />
                </ControlButton>
            </div>

            {/* --- NEW: Timeline Scrubber --- */}
            <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 w-8 text-right">{currentStep}</span>
                <input
                    type="range"
                    min={0}
                    max={totalSteps > 0 ? totalSteps - 1 : 0}
                    value={currentStep}
                    onChange={(e) => onScrub(Number(e.target.value))}
                    disabled={totalSteps === 0 || isLoading}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:cursor-not-allowed"
                />
                <span className="text-xs font-mono text-slate-400 w-8 text-left">{totalSteps > 0 ? totalSteps - 1 : 0}</span>
            </div>

            {/* --- Speed Control --- */}
            <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">Slow</span>
                <input
                    type="range"
                    min={100}
                    max={1500}
                    value={speed}
                    onChange={(e) => onSpeedChange(Number(e.target.value))}
                    disabled={isLoading}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <span className="text-sm text-slate-400">Fast</span>
            </div>
        </div>
    );
}
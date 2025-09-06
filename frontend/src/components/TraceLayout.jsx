import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import all the necessary visualizer sub-components
// Make sure the paths to these components are correct for your project structure
import AssignmentVisualizer from './visualizers/AssignmentVisualizer';
import OperationVisualizer from './visualizers/OperationVisualizer';
import LoopVisualizer from './visualizers/LoopVisualizer';
import ArrayOperationVisualizer from './visualizers/ArrayOperationVisualizer';
import ConditionVisualizer from './visualizers/ConditionVisualizer';
import ReturnVisualizer from './visualizers/ReturnVisualizer';
import RecursionTreeVisualizer from './visualizers/RecursionTreeVisualizer';
import VariablesVisualizer from './visualizers/VariablesVisualizer';
import CallStack from './visualizers/CallStack';
import usePrevious from '../hooks/usePrevious';
import PlaybackControls from './visualizers/PlaybackControls';

export default function TraceLayout({ trace, currentStep, callTree , isPlaying,
    onPlay,
    onPause,
    onNext,
    onPrev,
    onReset,
    onSpeedChange,
    speed,
    isLoading }) {
    const currentTraceStep = trace[currentStep] || {};
    const prevTraceStep = usePrevious(currentTraceStep);
    
    // Refs for animations that need to calculate positions
    const visualizerContainerRef = useRef(null);
    const variableRefs = useRef(new Map());
    
    // This is your function that decides which main animation to show
    const renderEventVisualizer = () => {
        const currentEvent = currentTraceStep?.event;
        
        if (callTree) {
            return <RecursionTreeVisualizer tree={callTree} currentStep={currentStep} trace={trace} />;
        }
        if (!currentEvent || typeof currentEvent !== 'object') {
            return <p className="text-[#94a3b8] text-center pt-8">Step does not have a special visualization.</p>;
        }

        const eventTypes = ['binary_operation', 'assignment', 'loop_iteration', 'array_operation', 'condition_check', 'return_value'];

        if (eventTypes.includes(currentEvent.type)) {
            return (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep} 
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                        className="w-full h-full flex items-center justify-center"
                    >
                        {currentEvent.type === 'binary_operation' && <OperationVisualizer event={currentEvent} />}
                        {currentEvent.type === 'assignment' && <AssignmentVisualizer event={currentEvent} />}
                        {currentEvent.type === 'loop_iteration' && <LoopVisualizer event={currentEvent} />}
                        {currentEvent.type === 'array_operation' && <ArrayOperationVisualizer event={currentEvent} />}
                        {currentEvent.type === 'condition_check' && <ConditionVisualizer event={currentEvent} />}
                        {currentEvent.type === 'return_value' && <ReturnVisualizer event={currentEvent} />}
                    </motion.div>
                </AnimatePresence>
            );
        }
        
        return <p className="text-[#94a3b8] text-center pt-8">No specific visual for this step type.</p>;
    };

    if (!trace || trace.length === 0) {
        return <p className="text-[#94a3b8] text-center pt-8">Click "Run Code" to start tracing.</p>;
    }
    
    return (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full overflow-y-auto ">
            
            {/* --- Left Column: Main Visualization & Controls --- */}
            <div className="lg:col-span-2 flex flex-col gap-4">
                <PlaybackControls 
                    isPlaying={isPlaying}
                    onPlay={onPlay}
                    onPause={onPause}
                    onNext={onNext}
                    onPrev={onPrev}
                    onReset={onReset}
                    onSpeedChange={onSpeedChange}
                    speed={speed}
                    isLoading={isLoading}
                    currentStep={currentStep}
                    totalSteps={trace.length}
                    trace={trace}
                />
                <div className="flex-shrink-0 text-center p-2 font-mono rounded-lg bg-[#0f172a] border border-[#334155]">
                    <p className="text-md text-[#f59e0b] font-semibold h-6">
                        {currentTraceStep?.event?.type || currentTraceStep?.event || 'Execution Start'}
                    </p>
                </div>
                <div className="flex-grow bg-[#0f172a] rounded-lg p-2 border border-[#334155] " ref={visualizerContainerRef}>
                    {renderEventVisualizer()}
                </div>
            </div>

            {/* --- Right Column: Inspector Sidebar --- */}
            <div className="flex flex-col gap-4 min-h-0">
                <div className="flex-1 flex flex-col bg-[#0f172a] rounded-lg border border-[#334155]">
                    <h3 className="font-bold text-lg flex-shrink-0 p-2 text-center text-[#94a3b8]">Call Stack</h3>
                    <div className="flex-grow min-h-0 p-2 overflow-y-auto">
                        <CallStack stackFrames={currentTraceStep?.stack || []} />
                    </div>
                </div>
                <div className="flex-1 flex flex-col bg-[#0f172a] rounded-lg border border-[#334155]">
                    <h3 className="font-bold text-lg flex-shrink-0 p-2 text-center text-[#94a3b8]">Variables</h3>
                    <div className="flex-grow min-h-0 p-2 overflow-y-auto">
                        <VariablesVisualizer 
                            locals={currentTraceStep?.locals || {}} 
                            prevLocals={prevTraceStep?.locals || {}} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
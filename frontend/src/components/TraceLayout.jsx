import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import all the necessary visualizer sub-components
// Make sure the paths to these components are correct for your project structure
import AssignmentVisualizer from "./visualizers/AssignmentVisualizer";
import OperationVisualizer from "./visualizers/OperationVisualizer";
import LoopVisualizer from "./visualizers/LoopVisualizer";
import ArrayOperationVisualizer from "./visualizers/ArrayOperationVisualizer";
import ConditionVisualizer from "./visualizers/ConditionVisualizer";
import ReturnVisualizer from "./visualizers/ReturnVisualizer";
import RecursionTreeVisualizer from "./visualizers/RecursionTreeVisualizer";
import VariablesVisualizer from "./visualizers/VariablesVisualizer";
import CallStack from "./visualizers/CallStack";
import usePrevious from "../hooks/usePrevious";
import PlaybackControls from "./visualizers/PlaybackControls";
import ExplanationPanel from "./visualizers/ExplanationPanel";
import DictionaryVisualizer from "./visualizers/DictionaryVisualizer";
import StringVisualizer from "./visualizers/StringVisualizer";

export default function TraceLayout({
  trace,
  currentStep,
  setCurrentStep,
  callTree,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onReset,
  onSpeedChange,
  speed,
  isLoading,
  callStackFrameRefs,
  onVariableHover,
  onVariableLeave,
}) {
  const currentTraceStep = trace[currentStep] || {};
  const prevTraceStep = usePrevious(currentTraceStep);

  // Refs for animations that need to calculate positions
  const visualizerContainerRef = useRef(null);
  // const variableRefs = useRef(new Map());

  // This is your function that decides which main animation to show
  const renderEventVisualizer = () => {
    const currentEvent = currentTraceStep?.event;

    if (!currentEvent || typeof currentEvent !== "object") {
      return (
        <p className="text-slate-400 text-center pt-8">
          Step does not have a special visualization.
        </p>
      );
    }

    // Using a switch statement is cleaner and easier to add new visualizers to.
    switch (currentEvent.type) {
      case "string_operation":
        return <StringVisualizer event={currentEvent} />;

      case "dictionary_operation":
        return <DictionaryVisualizer event={currentEvent} />;

      case "array_operation":
        return <ArrayOperationVisualizer event={currentEvent} />;

      case "binary_operation":
        return <OperationVisualizer event={currentEvent} />;

      case "assignment":
        return <AssignmentVisualizer event={currentEvent} />;

      case "condition_check":
        return <ConditionVisualizer event={currentEvent} />;

      case "loop_iteration":
      case "while_iteration":
        return <LoopVisualizer event={currentEvent} />;

      case "return_value":
        return <ReturnVisualizer event={currentEvent} />;

      default:
        // This is the fallback for any event that doesn't have a dedicated visualizer
        return (
          <p className="text-slate-400 text-center pt-8">
            No specific visual for this step type.
          </p>
        );
    }
  };

  if (!trace || trace.length === 0) {
    return (
      <p className="text-[#94a3b8] text-center pt-8">
        Click "Run Code" to start tracing.
      </p>
    );
  }

  //   return (
  //     <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full overflow-y-auto ">
  //       {/* --- Left Column: Main Visualization & Controls --- */}
  //       <div className="lg:col-span-2 flex flex-col gap-4">
  //         <PlaybackControls
  //           isPlaying={isPlaying}
  //           onPlay={onPlay}
  //           onPause={onPause}
  //           onNext={onNext}
  //           onPrev={onPrev}
  //           onReset={onReset}
  //           onSpeedChange={onSpeedChange}
  //           speed={speed}
  //           isLoading={isLoading}
  //           currentStep={currentStep}
  //           totalSteps={trace.length}
  //           trace={trace}
  //           onScrub={setCurrentStep}
  //         />
  //         <ExplanationPanel event={currentTraceStep?.event} />

  //          {/* Main container becomes a row for side-by-side layout */}
  //       <div className="flex-grow flex flex-row gap-4 min-h-0">

  //         {/* Left Panel: Recursion Tree (only shows if callTree exists) */}
  //         {callTree && (
  //           <div className="w-1/3 flex flex-col bg-[#0f172a] rounded-lg border border-[#334155] min-h-0">
  //             <h3 className="font-bold text-md flex-shrink-0 p-2 text-center text-[#94a3b8]">
  //               Recursion Tree
  //             </h3>
  //             {/* Make the tree area scrollable */}
  //             <div className="flex-grow p-2 overflow-auto">
  //               <RecursionTreeVisualizer
  //                 tree={callTree}
  //                 currentStep={currentStep}
  //                 trace={trace}
  //               />
  //             </div>
  //           </div>
  //         )}

  //         <div
  //           className="flex-grow bg-[#0f172a] rounded-lg p-2 border border-[#334155] "
  //           ref={visualizerContainerRef}
  //         >
  //           {renderEventVisualizer()}
  //         </div>
  //       </div>

  //       {/* --- Right Column: Inspector Sidebar --- */}
  //       <div className="flex flex-col gap-4 min-h-0">
  //         <div className="flex-1 flex flex-col bg-[#0f172a] rounded-lg border border-[#334155]">
  //           <h3 className="font-bold text-lg flex-shrink-0 p-2 text-center text-[#94a3b8]">
  //             Call Stack
  //           </h3>
  //           <div className="flex-grow min-h-0 p-2 overflow-y-auto">
  //             <CallStack stackFrames={currentTraceStep?.stack || []}
  //             callStackFrameRefs={callStackFrameRefs}
  //             />
  //           </div>
  //         </div>
  //         <div className="flex-1 flex flex-col bg-[#0f172a] rounded-lg border border-[#334155]">
  //           <h3 className="font-bold text-lg flex-shrink-0 p-2 text-center text-[#94a3b8]">
  //             Variables
  //           </h3>
  //           <div className="flex-grow min-h-0 p-2 overflow-y-auto">
  //             <VariablesVisualizer
  //               locals={currentTraceStep?.locals || {}}
  //               prevLocals={prevTraceStep?.locals || {}}
  //                 onVariableHover={onVariableHover}
  //               onVariableLeave={onVariableLeave}
  //             />
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full overflow-y-auto">
      {/* --- Left Column: Main Visualization & Controls --- */}
      <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
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
          onScrub={setCurrentStep}
        />
        <ExplanationPanel event={currentTraceStep?.event} />

        {/* Main container with side-by-side layout */}
        <div className="flex-grow flex flex-row gap-4 min-h-0">
          {/* Panel 1: Recursion Tree (conditional) */}
          {callTree && (
            <div className="w-1/3 flex flex-col bg-[#0f172a] rounded-lg border border-[#334155] min-h-0">
              <h3 className="font-bold text-md flex-shrink-0 p-2 text-center text-[#94a3b8]">
                Recursion Tree
              </h3>
              <div className="flex-grow p-2 overflow-auto">
                <RecursionTreeVisualizer
                  tree={callTree}
                  currentStep={currentStep}
                  trace={trace}
                />
              </div>
            </div>
          )}

          {/* Panel 2: Main Step-by-Step Animations */}
          <div
            className="flex-grow bg-[#0f172a] rounded-lg p-4 border border-[#334155]"
            ref={visualizerContainerRef}
          >
            {renderEventVisualizer()}
          </div>
        </div>
      </div>

      {/* --- Right Column: Inspector Sidebar (NOW IN THE CORRECT PLACE) --- */}
      <div className="flex flex-col gap-4 min-h-0">
        <div className="flex-1 flex flex-col bg-[#0f172a] rounded-lg border border-[#334155]">
          <h3 className="font-bold text-lg flex-shrink-0 p-2 text-center text-[#94a3b8]">
            Call Stack
          </h3>
          <div className="flex-grow min-h-0 p-2 overflow-y-auto">
            <CallStack
              stackFrames={currentTraceStep?.stack || []}
              callStackFrameRefs={callStackFrameRefs}
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col bg-[#0f172a] rounded-lg border border-[#334155]">
          <h3 className="font-bold text-lg flex-shrink-0 p-2 text-center text-[#94a3b8]">
            Variables
          </h3>
          <div className="flex-grow min-h-0 p-2 overflow-y-auto">
            <VariablesVisualizer
              locals={currentTraceStep?.locals || {}}
              prevLocals={prevTraceStep?.locals || {}}
              onVariableHover={onVariableHover}
              onVariableLeave={onVariableLeave}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* eslint-disable no-irregular-whitespace */
import React, { useRef, useState, useEffect, useCallback } from "react"; // <-- FIXED: Added useState and useCallback
import { motion, AnimatePresence } from "framer-motion";

// Import all the necessary visualizer sub-components
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
import PrintVisualizer from "./visualizers/PrintVisualizer";

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

  // Refs and State for content scaling (NEW)
  const visualizerContainerRef = useRef(null);
  const [scale, setScale] = useState(1);

  // This callback will measure and update the scale (NEW)
  const updateScale = useCallback(() => {
    const container = visualizerContainerRef.current;
    // Target the wrapper inside the current visualizer
    const content = container?.querySelector('.visualizer-content-wrapper');

    if (!container || !content) {
      // Reset scale if no content is present
      if (scale !== 1) setScale(1); 
      return;
    }

    const containerWidth = container.clientWidth - 32; // Account for p-4 padding (16*2)
    const containerHeight = container.clientHeight - 32;
    // Use scroll dimensions to get the true, unscaled size of the content
    const contentWidth = content.scrollWidth;
    const contentHeight = content.scrollHeight;

    if (contentWidth === 0 || contentHeight === 0) return;

    // Calculate scale to fit both width and height, with a 5% margin
    const widthScale = containerWidth / contentWidth;
    const heightScale = containerHeight / contentHeight;
    const newScale = Math.min(widthScale, heightScale) * 1.05;

    // Only update if the scale factor is calculated or if we need to reset to 1
    setScale(Math.min(newScale, 1.2));
  }, [scale]);


  // Effect to handle resizing, initial scaling, and step changes (NEW)
  useEffect(() => {
    const container = visualizerContainerRef.current;
    if (!container) return;

    // Delayed initial run to ensure content has rendered
    const timeoutId = setTimeout(updateScale, 100);

    // Observe container resize events
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);

    // Re-run scale calculation whenever step changes (in case new visualizer renders)
    updateScale();

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [currentStep, updateScale]);


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
      case "print_event":
        // PASS SCALE AND updateScale
        return <PrintVisualizer event={currentEvent} scale={scale} updateScale={updateScale} />;

      case "string_operation":
        return <StringVisualizer event={currentEvent} scale={scale} updateScale={updateScale} />;

      case "dictionary_operation":
        return <DictionaryVisualizer event={currentEvent} scale={scale} updateScale={updateScale} />;

      case "array_operation":
        return <ArrayOperationVisualizer event={currentEvent} scale={scale} updateScale={updateScale} />;

      case "binary_operation":
        return <OperationVisualizer event={currentEvent} scale={scale} updateScale={updateScale} />;

      case "assignment":
        return <AssignmentVisualizer event={currentEvent} scale={scale} updateScale={updateScale} />;

      case "condition_check":
        return <ConditionVisualizer event={currentEvent} scale={scale} updateScale={updateScale} />;

      case "loop_iteration":
      case "while_iteration":
        return <LoopVisualizer event={currentEvent} scale={scale} updateScale={updateScale} />;

      case "return_value":
        return <ReturnVisualizer event={currentEvent} scale={scale} updateScale={updateScale} />;

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
                  // Recursion Tree handles its own internal scaling logic
                />
              </div>
            </div>
          )}

          {/* Panel 2: Main Step-by-Step Animations - Container for scaling */}
          <div
            className="flex-grow bg-[#0f172a] rounded-lg p-4 border border-[#334155] relative overflow-hidden flex items-center justify-center" // Ensure flex/center/overflow
            ref={visualizerContainerRef}
          >
            {renderEventVisualizer()}
          </div>
        </div>
      </div>

      {/* --- Right Column: Inspector Sidebar --- */}
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
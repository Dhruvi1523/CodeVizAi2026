import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { DP_ALGORITHMS } from "../../data/dp_algorithms";
import { parseInputs } from "../../utils/input_parser";
import ControlDeck from "./ControlDeck";
import DPGrid from "./DPGrid";
import DPArray from "./DPArray";
import Variables from "./Variables";
import RecursionTree from "./RecursionTree";
import MemoTable from "./MemoTable";

// Component map for dynamic rendering
const vizComponents = {
  "grid-2d": DPGrid,
  "array-1d": DPArray,
  "variables": Variables,
  "tree": RecursionTree,
  "key-value": MemoTable,
};

const AppMode = { BOTTOM_UP: "bottom-up", TOP_DOWN: "top-down" };

// A simple SVG spinner component for loading states
const Loader = () => (
  <div className="flex justify-center items-center h-full">
    <svg className="animate-spin h-10 w-10 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
);

export default function DpVisualizationPage() {
  const { algoId } = useParams();
  const [mode, setMode] = useState(AppMode.BOTTOM_UP);
  const [inputs, setInputs] = useState(DP_ALGORITHMS[algoId]?.defaultValues || {});
  const [trace, setTrace] = useState({});
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);

  const activeTrace = trace[mode] || [];
  const totalSteps = activeTrace.length;
  const currentFrame = activeTrace[currentStep] || {};
  const isAnimationComplete = currentStep === totalSteps - 1 && totalSteps > 0;

  const fetchVisualizations = useCallback(async (currentInputs) => {
    setIsLoading(true);
    setIsPlaying(false);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/visualize/${algoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentInputs),
      });
      const data = await response.json();
      setTrace(data);
      setOutput(data.output || "");
      setCurrentStep(0);
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setIsLoading(false);
    }
  }, [algoId]);

  useEffect(() => {
    const parsedDefaultInputs = parseInputs(DP_ALGORITHMS[algoId]?.defaultValues, algoId);
    fetchVisualizations(parsedDefaultInputs);
  }, [algoId, fetchVisualizations]);

  useEffect(() => {
    let interval;
    if (isPlaying && currentStep < totalSteps - 1) {
      interval = setInterval(() => setCurrentStep((prev) => prev + 1), 1100 - speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, totalSteps, speed]);

  const handleModeChange = (newMode) => {
    setIsPlaying(false);
    setCurrentStep(0);
    setMode(newMode);
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-950 min-h-screen text-white flex flex-col gap-4">
      {/* --- SECTION 1: Minimalist Header --- */}
      <header className="flex items-center gap-4">
          <Link to="/dynamic-programming" className="text-blue-400 hover:underline">&larr; Back to Algorithms</Link>
          <div className="w-px h-6 bg-gray-700"></div>
          <h1 className="text-2xl font-bold text-gray-200">
            {DP_ALGORITHMS[algoId]?.name}
          </h1>
      </header>

      {/* --- SECTION 2: The All-in-One Control Deck --- */}
      <ControlDeck
        algoId={algoId}
        inputs={inputs}
        onInputsChange={setInputs}
        onVisualize={fetchVisualizations}
        mode={mode}
        onModeChange={handleModeChange}
        isTopDownDisabled={!trace["top-down"] || trace["top-down"].length === 0}
        isPlaying={isPlaying}
        isLoading={isLoading}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onNext={() => setCurrentStep((s) => Math.min(s + 1, totalSteps - 1))}
        onPrev={() => setCurrentStep((s) => Math.max(s - 1, 0))}
        onSpeedChange={setSpeed}
      />
      
      
      {/* --- SECTION 3: Live Info Panels --- */}
      <div className="space-y-3">
        <div className="text-center h-12 p-2 font-mono text-md text-yellow-300 bg-gray-800 rounded flex items-center justify-center border border-gray-700">
          {currentFrame.explanation || "Visualization ready."}
        </div>
      </div>
      
      {/* --- SECTION 4: Visualization Area --- */}
      <main className="flex-grow min-h-[400px]">
        {isLoading ? <Loader /> 
        : !activeTrace || activeTrace.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500">
                No visualization data. Click 'Visualize' to generate.
            </div>
        )
        : mode === AppMode.BOTTOM_UP ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentFrame.visualizations?.map((viz, index) => {
              const VizComponent = vizComponents[viz.type];
              if (!VizComponent) return null;
              return (
                <div key={index} className="bg-gray-900 rounded-lg p-4 flex flex-col border border-gray-700">
                  <h3 className="text-lg font-semibold mb-2 text-gray-300">{viz.title}</h3>
                  <div className="flex-grow"><VizComponent {...viz.data} /></div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-900 rounded-lg p-4 flex flex-col border border-gray-700">
              <h3 className="text-lg font-semibold mb-2 text-gray-300">Recursion Tree</h3>
              <div className="flex-grow">
                <RecursionTree {...currentFrame.visualizations?.find(v => v.type === 'tree')?.data} />
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 flex flex-col border border-gray-700">
              <h3 className="text-lg font-semibold mb-2 text-gray-300">Memoization Table</h3>
              <div className="flex-grow">
                <MemoTable {...currentFrame.visualizations?.find(v => v.type === 'key-value')?.data} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- SECTION 5: Final Result --- */}
      {isAnimationComplete && (
        <div className="mt-2">
          <h2 className="text-xl text-center font-bold mb-2 text-green-400">Final Result</h2>
          <div className="text-center h-12 p-2 font-semibold text-lg text-white bg-green-600 bg-opacity-30 rounded flex items-center justify-center border border-green-500">
            {output}
          </div>
        </div>
      )}
    </div>
  );
}
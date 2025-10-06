// SortingPage.jsx
import React from "react";
import Navbar from "../../components/Navbar";
import ArrayInput from "../../components/Array/ArrayInput";
import SearchInput from "../../components/Array/SearchInput";
import ControlPanel from "../../components/Array/ControlPanel";
import VisualizationContainer from "../../components/Array/VisualizationContainer";
import CodeDisplay from "../../components/Array/CodeDisplay";
import { useAlgorithmVisualization } from "../../hooks/useAlgorithmVisualization";
import { getAlgorithmById } from "../../data/algorithms";
import { useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom"

function SortingPage() {
  const { algoId } = useParams();
  console.log(algoId);
  const selectedAlgorithm = getAlgorithmById(algoId);

  const {
    state,
    currentStep,
    canStep,
    originalArray,
    searchTarget,
    play,
    pause,
    step,
    reset,
    generateNewArray,
    setCustomArray,
    setSearchTargetValue,
    changeSpeed,
    changeArraySize,
  } = useAlgorithmVisualization(algoId);

  const isSearchAlgorithm = selectedAlgorithm?.category === "searching";

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden max-h-screen">
        {/* Left Panel: Control + Visualization */}

        {/* Right Panel: Inputs + Code */}
        <div className="flex flex-col flex-1 h-full p-4 overflow-y-auto bg-gray-800 rounded-l-xl">
          {/* Header section */}
          <div className="flex items-center gap-3 mb-4">
            <Link
              to="/array"
              className="
        flex items-center justify-center
        w-10 h-10 
        text-[#94a3b8] 
        hover:bg-[#334155] hover:text-[#f1f5f9] 
        rounded-full transition-colors
        duration-200
      "
              title="Back to Visualizers"
            >
              <ChevronLeft size={24} />
            </Link>
            <h2 className="text-xl font-semibold text-white">
              {selectedAlgorithm?.name || "Algorithm"}
            </h2>
          </div>

          {/* Array input */}
          <ArrayInput
            currentArray={originalArray}
            onArrayChange={setCustomArray}
          />

          {/* Search input (if applicable) */}
          {isSearchAlgorithm && (
            <SearchInput
              onSearch={setSearchTargetValue}
              currentArray={originalArray}
              isSearchAlgorithm={isSearchAlgorithm}
            />
          )}

          {/* Code display */}
          <div className="mt-4 flex-1 overflow-y-auto">
            <CodeDisplay
              algorithmId={state.selectedAlgorithm}
              algorithmName={selectedAlgorithm.name}
            />
          </div>
        </div>

        <div className="flex flex-col flex-3 h-full overflow-auto">
          {/* Control Panel at top */}
          <div className="p-4">
            <ControlPanel
              isPlaying={state.isPlaying}
              onPlay={play}
              onPause={pause}
              onStep={step}
              onReset={reset}
              onGenerateArray={generateNewArray}
              speed={state.speed}
              onSpeedChange={changeSpeed}
              arraySize={state.arraySize}
              onArraySizeChange={changeArraySize}
              canStep={canStep}
            />
          </div>

          {/* Visualization takes remaining space */}
          <div className="flex-1 p-4 overflow-hidden">
            <VisualizationContainer
              algorithmId={state.selectedAlgorithm}
              steps={state.steps}
              currentStepIndex={state.currentStep}
              currentStep={currentStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SortingPage;

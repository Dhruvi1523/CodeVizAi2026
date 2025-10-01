// SortingPage.jsx
import React from "react";
import Navbar from "../components/Navbar";
import AlgorithmSelector from "../components/AlgorithmSelector";
import ArrayInput from "../components/ArrayInput";
import SearchInput from "../components/SearchInput";
import ControlPanel from "../components/ControlPanel";
import VisualizationContainer from "../components/VisualizationContainer";
import CodeDisplay from "../components/CodeDisplay";
import { useAlgorithmVisualization } from "../hooks/useAlgorithmVisualization";
import { getAlgorithmById } from "../data/algorithms";

function SortingPage() {
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
    changeAlgorithm,
    changeSpeed,
    changeArraySize,
  } = useAlgorithmVisualization();

  const selectedAlgorithm = getAlgorithmById(state.selectedAlgorithm);
  const isSearchAlgorithm = selectedAlgorithm?.category === "searching";

  if (!selectedAlgorithm) return <div>Loading...</div>;

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden max-h-screen">
        {/* Left Panel: Control + Visualization */}
       

        {/* Right Panel: Inputs + Code */}
        <div className="flex flex-col flex-1 h-full p-4 overflow-y-auto bg-gray-800 rounded-l-xl">
          <AlgorithmSelector
            selectedAlgorithm={state.selectedAlgorithm}
            onAlgorithmChange={changeAlgorithm}
          />
          <ArrayInput
            currentArray={originalArray}
            onArrayChange={setCustomArray}
          />
          {isSearchAlgorithm && (
            <SearchInput
              onSearch={setSearchTargetValue}
              currentArray={originalArray}
              isSearchAlgorithm={isSearchAlgorithm}
            />
          )}
          <div className="mt-4 flex-1 overflow-y-auto">
            <CodeDisplay
              algorithmId={state.selectedAlgorithm}
              algorithmName={selectedAlgorithm.name}
            />
          </div>
        </div>

         <div className="flex flex-col flex-3 h-full">
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

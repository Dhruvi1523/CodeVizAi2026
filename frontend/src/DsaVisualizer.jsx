import React from 'react';
import Navbar from './components/Navbar';
import AlgorithmSelector from './components/AlgorithmSelector';
import ArrayInput from './components/ArrayInput';
import SearchInput from './components/SearchInput';
import ControlPanel from './components/ControlPanel';
import VisualizationContainer from './components/VisualizationContainer';
import CodeDisplay from './components/CodeDisplay';
import { useAlgorithmVisualization } from './hooks/useAlgorithmVisualization';
import { getAlgorithmById } from './data/algorithms';

function App() {
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
  const isSearchAlgorithm = selectedAlgorithm?.category === 'searching';

  if (!selectedAlgorithm) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Visualization */}
          <div className="lg:col-span-2 space-y-6">
            <AlgorithmSelector
              selectedAlgorithm={state.selectedAlgorithm}
              onAlgorithmChange={changeAlgorithm}
            />
            
            <ArrayInput
              currentArray={originalArray}
              onArrayChange={setCustomArray}
            />
            
            <SearchInput
              onSearch={setSearchTargetValue}
              currentArray={originalArray}
              isSearchAlgorithm={isSearchAlgorithm}
            />
            
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
            
            <VisualizationContainer
              algorithmId={state.selectedAlgorithm}
              steps={state.steps}
              currentStepIndex={state.currentStep}
              currentStep={currentStep}
            />
          </div>

          {/* Right Panel - Algorithm Code */}
          <div className="lg:col-span-1">
            <CodeDisplay
              algorithmId={state.selectedAlgorithm}
              algorithmName={selectedAlgorithm.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
import { useState, useEffect, useCallback, useRef } from 'react';
import { AlgorithmStep, VisualizationState } from '../types';
import { executeAlgorithm } from '../utils/algorithmExecutor';
import { generateRandomArray } from '../utils/arrayGenerator';

export const useAlgorithmVisualization = () => {
  const [state, setState] = useState<VisualizationState>({
    isPlaying: false,
    currentStep: 0,
    steps: [],
    speed: 500,
    arraySize: 20,
    selectedAlgorithm: 'bubble-sort',
  });

  const [originalArray, setOriginalArray] = useState<number[]>([64, 34, 25, 12, 22, 11, 90, 88, 76, 50, 42, 30, 18, 95, 3]);
  const [searchTarget, setSearchTarget] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate initial array
  useEffect(() => {
    generateSteps(state.selectedAlgorithm, originalArray);
  }, [state.selectedAlgorithm, originalArray, searchTarget]);

  const generateSteps = useCallback((algorithmId: string, array: number[], target?: number) => {
    try {
      const steps = executeAlgorithm(algorithmId, array, target);
      setState(prev => ({
        ...prev,
        steps,
        currentStep: 0,
        isPlaying: false
      }));
    } catch (error) {
      console.error('Error executing algorithm:', error);
      setState(prev => ({
        ...prev,
        steps: [{ action: 'error', array: [...array] }],
        currentStep: 0,
        isPlaying: false
      }));
    }
  }, []);

  const play = useCallback(() => {
    if (state.currentStep >= state.steps.length - 1) return;
    
    setState(prev => ({ ...prev, isPlaying: true }));
    
    intervalRef.current = setInterval(() => {
      setState(prev => {
        if (prev.currentStep >= prev.steps.length - 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return { ...prev, isPlaying: false };
        }
        return { ...prev, currentStep: prev.currentStep + 1 };
      });
    }, state.speed);
  }, [state.currentStep, state.steps.length, state.speed]);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const step = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.steps.length - 1),
      isPlaying: false
    }));
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: 0, isPlaying: false }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const generateNewArray = useCallback(() => {
    const newArray = generateRandomArray(state.arraySize);
    setOriginalArray(newArray);
    setSearchTarget(null);
  }, [state.arraySize, state.selectedAlgorithm, generateSteps]);

  const setCustomArray = useCallback((array: number[]) => {
    setOriginalArray(array);
    setSearchTarget(null);
  }, []);

  const setSearchTargetValue = useCallback((target: number) => {
    setSearchTarget(target);
  }, []);
  const changeAlgorithm = useCallback((algorithmId: string) => {
    setState(prev => ({ ...prev, selectedAlgorithm: algorithmId }));
    setSearchTarget(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const changeSpeed = useCallback((speed: number) => {
    setState(prev => ({ ...prev, speed }));
  }, []);

  const changeArraySize = useCallback((arraySize: number) => {
    setState(prev => ({ ...prev, arraySize }));
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update interval when speed changes during playback
  useEffect(() => {
    if (state.isPlaying && intervalRef.current) {
      clearInterval(intervalRef.current);
      play();
    }
  }, [state.speed]);

  const currentStep = state.steps[state.currentStep] || null;
  const canStep = state.currentStep < state.steps.length - 1;

  return {
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
  };
};

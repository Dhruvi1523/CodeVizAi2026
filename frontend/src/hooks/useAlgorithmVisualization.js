import { executeAlgorithm } from '../utils/algorithmExecutor';
import React, { useState, useEffect, useCallback, useRef } from 'react';
export const useAlgorithmVisualization = () => {
  const [state, setState] = useState({
    isPlaying: false,
    currentStep: 0,
    steps: [],
    speed: 500,
    arraySize: 20,
    selectedAlgorithm: 'bubble-sort',
  });

  const [originalArray, setOriginalArray] = useState([64, 34, 25, 12, 22, 11, 90, 88, 76, 50, 42, 30, 18, 95, 3]);
  const [searchTarget, setSearchTarget] = useState(null);
  const intervalRef = useRef(null);

  // Generate initial array
  useEffect(() => {
    generateSteps(state.selectedAlgorithm, originalArray);
  }, [state.selectedAlgorithm, originalArray, searchTarget]);

  const generateSteps = useCallback((algorithmId, array, target) => {
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

  const setCustomArray = useCallback((array) => {
    setOriginalArray(array);
    setSearchTarget(null);
  }, []);

  const setSearchTargetValue = useCallback((target) => {
    setSearchTarget(target);
  }, []);
  const changeAlgorithm = useCallback((algorithmId) => {
    setState(prev => ({ ...prev, selectedAlgorithm: algorithmId }));
    setSearchTarget(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const changeSpeed = useCallback((speed) => {
    setState(prev => ({ ...prev, speed }));
  }, []);

  const changeArraySize = useCallback((arraySize) => {
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
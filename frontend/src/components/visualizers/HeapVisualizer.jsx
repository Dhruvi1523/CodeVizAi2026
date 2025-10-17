import React, { useState, useEffect } from 'react';
import { ChevronDown, RotateCcw, Play, Pause } from 'lucide-react';

const HeapVisualizer = () => {
  const [heap, setHeap] = useState([]);
  const [heapType, setHeapType] = useState('min');
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState([]);
  const [animating, setAnimating] = useState(false);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [swapNodes, setSwapNodes] = useState([]);
  const [explanation, setExplanation] = useState('Select heap type and start inserting values');
  const [speed, setSpeed] = useState(1000);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms / (speed / 1000)));

  const addToHistory = (operation, value = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setHistory(prev => [...prev, { operation, value, heap: [...heap], timestamp }]);
  };

  const swap = (arr, i, j) => {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  };

  const compare = (a, b) => {
    return heapType === 'min' ? a < b : a > b;
  };

  const heapifyUp = async (arr, index) => {
    if (index === 0) return arr;
    
    const parentIndex = Math.floor((index - 1) / 2);
    setHighlightedNodes([index, parentIndex]);
    setExplanation(`Comparing node at index ${index} (value: ${arr[index]}) with parent at index ${parentIndex} (value: ${arr[parentIndex]})`);
    await sleep(speed);

    if (compare(arr[index], arr[parentIndex])) {
      setSwapNodes([index, parentIndex]);
      setExplanation(`Swapping ${arr[index]} with ${arr[parentIndex]} to maintain ${heapType} heap property`);
      await sleep(speed);
      
      swap(arr, index, parentIndex);
      setHeap([...arr]);
      setSwapNodes([]);
      await sleep(speed);
      
      return heapifyUp(arr, parentIndex);
    }
    
    setHighlightedNodes([]);
    return arr;
  };

  const heapifyDown = async (arr, index = 0) => {
    const leftChild = 2 * index + 1;
    const rightChild = 2 * index + 2;
    let targetIndex = index;

    setHighlightedNodes([index, leftChild, rightChild].filter(i => i < arr.length));
    setExplanation(`Checking node at index ${index} (value: ${arr[index]}) with its children`);
    await sleep(speed);

    if (leftChild < arr.length && compare(arr[leftChild], arr[targetIndex])) {
      targetIndex = leftChild;
    }

    if (rightChild < arr.length && compare(arr[rightChild], arr[targetIndex])) {
      targetIndex = rightChild;
    }

    if (targetIndex !== index) {
      setSwapNodes([index, targetIndex]);
      setExplanation(`Swapping ${arr[index]} with ${arr[targetIndex]} to maintain ${heapType} heap property`);
      await sleep(speed);
      
      swap(arr, index, targetIndex);
      setHeap([...arr]);
      setSwapNodes([]);
      await sleep(speed);
      
      return heapifyDown(arr, targetIndex);
    }

    setHighlightedNodes([]);
    return arr;
  };

  const insert = async () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setExplanation('Please enter a valid number');
      return;
    }

    setAnimating(true);
    const newHeap = [...heap, value];
    setHeap(newHeap);
    setExplanation(`Inserting ${value} at the end of the heap`);
    await sleep(speed);

    await heapifyUp(newHeap, newHeap.length - 1);
    
    addToHistory('insert', value);
    setExplanation(`Successfully inserted ${value} into ${heapType} heap`);
    setInputValue('');
    setAnimating(false);
  };

  const extractRoot = async () => {
    if (heap.length === 0) {
      setExplanation('Heap is empty');
      return;
    }

    setAnimating(true);
    const root = heap[0];
    setHighlightedNodes([0]);
    setExplanation(`Extracting ${heapType === 'min' ? 'minimum' : 'maximum'} value: ${root}`);
    await sleep(speed);

    if (heap.length === 1) {
      setHeap([]);
      setHighlightedNodes([]);
      addToHistory('extract', root);
      setExplanation(`Extracted ${root}. Heap is now empty`);
      setAnimating(false);
      return;
    }

    const newHeap = [...heap];
    newHeap[0] = newHeap[newHeap.length - 1];
    newHeap.pop();
    setHeap(newHeap);
    setExplanation(`Moving last element ${newHeap[0]} to root and removing last position`);
    await sleep(speed);

    await heapifyDown(newHeap, 0);

    addToHistory('extract', root);
    setExplanation(`Extracted ${root}. Heap rebalanced`);
    setAnimating(false);
  };

  const buildHeap = async (values) => {
    setAnimating(true);
    const newHeap = [...values];
    setHeap(newHeap);
    setExplanation('Building heap from array...');
    await sleep(speed);

    for (let i = Math.floor(newHeap.length / 2) - 1; i >= 0; i--) {
      await heapifyDown(newHeap, i);
    }

    addToHistory('build', values.join(','));
    setExplanation('Heap built successfully');
    setAnimating(false);
  };

  const reset = () => {
    setHeap([]);
    setHistory([]);
    setHighlightedNodes([]);
    setSwapNodes([]);
    setExplanation('Select heap type and start inserting values');
    setInputValue('');
  };

  const getNodePosition = (index, totalNodes) => {
    const level = Math.floor(Math.log2(index + 1));
    const maxNodesInLevel = Math.pow(2, level);
    const positionInLevel = index - (Math.pow(2, level) - 1);
    
    const levelWidth = 800;
    const nodeSpacing = levelWidth / (maxNodesInLevel + 1);
    const x = nodeSpacing * (positionInLevel + 1);
    const y = 100 + level * 120;
    
    return { x, y };
  };

  const renderTree = () => {
    if (heap.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>Heap is empty. Insert values to see visualization.</p>
        </div>
      );
    }

    return (
      <svg width="100%" height="600" className="overflow-visible">
        {heap.map((value, index) => {
          const parentIndex = Math.floor((index - 1) / 2);
          if (index > 0) {
            const parentPos = getNodePosition(parentIndex, heap.length);
            const childPos = getNodePosition(index, heap.length);
            
            return (
              <line
                key={`line-${index}`}
                x1={parentPos.x}
                y1={parentPos.y}
                x2={childPos.x}
                y2={childPos.y}
                stroke="#4b5563"
                strokeWidth="2"
              />
            );
          }
          return null;
        })}

        {heap.map((value, index) => {
          const { x, y } = getNodePosition(index, heap.length);
          const isHighlighted = highlightedNodes.includes(index);
          const isSwapping = swapNodes.includes(index);
          
          return (
            <g key={`node-${index}`}>
              <circle
                cx={x}
                cy={y}
                r="30"
                fill={isSwapping ? '#ef4444' : isHighlighted ? '#fbbf24' : heapType === 'min' ? '#3b82f6' : '#8b5cf6'}
                stroke="#1f2937"
                strokeWidth="2"
                className="transition-all duration-300"
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="18"
                fontWeight="bold"
              >
                {value}
              </text>
              <text
                x={x}
                y={y + 50}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="12"
              >
                [{index}]
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Min/Max Heap Visualizer
        </h1>
        <p className="text-gray-400 mb-6">Interactive visualization of heap data structure operations</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Heap Tree Structure</h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">Type:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => !animating && heap.length === 0 && setHeapType('min')}
                      disabled={animating || heap.length > 0}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        heapType === 'min'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      } ${(animating || heap.length > 0) && 'opacity-50 cursor-not-allowed'}`}
                    >
                      Min Heap
                    </button>
                    <button
                      onClick={() => !animating && heap.length === 0 && setHeapType('max')}
                      disabled={animating || heap.length > 0}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        heapType === 'max'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      } ${(animating || heap.length > 0) && 'opacity-50 cursor-not-allowed'}`}
                    >
                      Max Heap
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 min-h-[500px]">
                {renderTree()}
              </div>

              <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-400">Array Representation:</span>
                  <span className="text-sm text-gray-500">Size: {heap.length}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {heap.length === 0 ? (
                    <span className="text-gray-500">[]</span>
                  ) : (
                    heap.map((value, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded ${
                          swapNodes.includes(index)
                            ? 'bg-red-600'
                            : highlightedNodes.includes(index)
                            ? 'bg-yellow-600'
                            : heapType === 'min'
                            ? 'bg-blue-600'
                            : 'bg-purple-600'
                        }`}
                      >
                        {value}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Current Operation</h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <p className="text-gray-300">{explanation}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Controls</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Insert Value</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !animating && insert()}
                      disabled={animating}
                      placeholder="Enter number"
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    />
                    <button
                      onClick={insert}
                      disabled={animating || !inputValue}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-all"
                    >
                      Insert
                    </button>
                  </div>
                </div>

                <button
                  onClick={extractRoot}
                  disabled={animating || heap.length === 0}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-all"
                >
                  Extract {heapType === 'min' ? 'Min' : 'Max'}
                </button>

                <button
                  onClick={reset}
                  disabled={animating}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} />
                  Reset
                </button>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Animation Speed</label>
                  <input
                    type="range"
                    min="200"
                    max="2000"
                    step="100"
                    value={speed}
                    onChange={(e) => setSpeed(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Fast</span>
                    <span>Slow</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => buildHeap([10, 20, 15, 30, 40])}
                  disabled={animating || heap.length > 0}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-sm transition-all"
                >
                  Build Sample Heap
                </button>
                <button
                  onClick={() => buildHeap(Array.from({length: 7}, () => Math.floor(Math.random() * 100)))}
                  disabled={animating || heap.length > 0}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-sm transition-all"
                >
                  Random Heap (7 nodes)
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-3">History</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-gray-500 text-sm">No operations yet</p>
                ) : (
                  history.map((item, index) => (
                    <div key={index} className="bg-gray-900 rounded p-3 text-sm">
                      <div className="flex justify-between items-start">
                        <span className="font-medium capitalize text-gray-300">
                          {item.operation}
                          {item.value && <span className="text-blue-400"> {item.value}</span>}
                        </span>
                        <span className="text-xs text-gray-500">{item.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-3">Heap Properties</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-blue-400 mb-2">Min Heap</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Parent ≤ Children</li>
                <li>• Root is minimum value</li>
                <li>• Extract returns smallest element</li>
              </ul>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-purple-400 mb-2">Max Heap</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Parent ≥ Children</li>
                <li>• Root is maximum value</li>
                <li>• Extract returns largest element</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeapVisualizer;
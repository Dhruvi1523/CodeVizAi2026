import React from 'react';
import { algorithms } from '../data/algorithms';

function AlgorithmSelector(props) {
  const sortingAlgorithms = algorithms.filter(algo => algo.category === 'sorting');
  const searchingAlgorithms = algorithms.filter(algo => algo.category === 'searching');

  return (
    <div className="mb-6">
      <label htmlFor="algorithm" className="block text-sm font-medium text-gray-300 mb-2">
        Select Algorithm
      </label>
      <select
        id="algorithm"
        value={props.selectedAlgorithm}
        onChange={e => props.onAlgorithmChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <optgroup label="Sorting Algorithms">
          {sortingAlgorithms.map(algo => (
            <option key={algo.id} value={algo.id}>
              {algo.name}
            </option>
          ))}
        </optgroup>
        <optgroup label="Searching Algorithms">
          {searchingAlgorithms.map(algo => (
            <option key={algo.id} value={algo.id}>
              {algo.name}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}

export default AlgorithmSelector;

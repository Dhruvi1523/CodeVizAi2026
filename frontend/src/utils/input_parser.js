import { DP_ALGORITHMS } from '../data/dp_algorithms';

// This helper function is now in its own file and can be imported anywhere.
export const parseInputs = (inputs, algoId) => {
  const parsed = { ...inputs };
  const algoInputs = DP_ALGORITHMS[algoId]?.inputs || [];

  for (const input of algoInputs) {
    // Check for comma-separated numbers (for weights, values, coins)
    if (input.type === 'text' && String(parsed[input.id]).includes(',')) {
      parsed[input.id] = String(parsed[input.id])
        .split(',')
        .map(s => Number(s.trim()))
        .filter(n => !isNaN(n)); // Filter out any non-numeric results
    } else if (input.type === 'number') {
      parsed[input.id] = Number(parsed[input.id]);
    }
  }
  return parsed;
};
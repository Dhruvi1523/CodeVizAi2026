export const algorithms = [
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'sorting',
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: true,
    description: 'Compares adjacent elements and swaps them if they are in the wrong order.',
    visualization: 'bars'
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'sorting',
    timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: false,
    description: 'Finds the minimum element and places it at the beginning.',
    visualization: 'bars'
  },
  {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'sorting',
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: true,
    description: 'Builds the sorted array one element at a time.',
    visualization: 'bars'
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'sorting',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)',
    stable: true,
    description: 'Divides the array into halves, sorts them, and merges back together.',
    visualization: 'tree'
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'sorting',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    spaceComplexity: 'O(log n)',
    stable: false,
    description: 'Selects a pivot and partitions the array around it.',
    visualization: 'bars'
  },
  {
    id: 'heap-sort',
    name: 'Heap Sort',
    category: 'sorting',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(1)',
    stable: false,
    description: 'Converts array to heap, then repeatedly extracts maximum.',
    visualization: 'bars'
  },
  {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'searching',
    timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(1)',
    stable: true,
    description: 'Searches for an element by checking each element sequentially.',
    visualization: 'bars'
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'searching',
    timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(1)',
    stable: true,
    description: 'Searches for an element by repeatedly dividing the search space in half.',
    visualization: 'bars'
  },
  {
    id: 'counting-sort',
    name: 'Counting Sort',
    category: 'sorting',
    timeComplexity: { best: 'O(n + k)', average: 'O(n + k)', worst: 'O(n + k)' },
    spaceComplexity: 'O(k)',
    stable: true,
    description: 'Counts occurrences of each element and calculates their positions to build the sorted array. Works only with integers.',
    visualization: 'bars'
  }
];

export function getAlgorithmById(id) {
  return algorithms.find(algo => algo.id === id);
}

export function getAlgorithmsByCategory(category) {
  return algorithms.filter(algo => algo.category === category);
}

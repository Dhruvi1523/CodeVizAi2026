export const algorithms = [
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'sorting',
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: true,
    description: 'Compares adjacent elements and swaps them if they are in the wrong order.',
    visualization: 'bars',
    path: '/array/sorting/bubble-sort'
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'sorting',
    timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: false,
    description: 'Finds the minimum element and places it at the beginning.',
    visualization: 'bars',
    path: '/array/sorting/selection-sort'
  },
  {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'sorting',
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: true,
    description: 'Builds the sorted array one element at a time.',
    visualization: 'bars',
    path: '/array/sorting/insertion-sort'
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'sorting',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)',
    stable: true,
    description: 'Divides the array into halves, sorts them, and merges back together.',
    visualization: 'tree',
    path: '/array/sorting/merge-sort'
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'sorting',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    spaceComplexity: 'O(log n)',
    stable: false,
    description: 'Selects a pivot and partitions the array around it.',
    visualization: 'bars',
    path: '/array/sorting/quick-sort'
  },
  {
    id: 'heap-sort',
    name: 'Heap Sort',
    category: 'sorting',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(1)',
    stable: false,
    description: 'Converts array to heap, then repeatedly extracts maximum.',
    visualization: 'bars',
    path: '/array/sorting/heap-sort'
  },
  {
    id: 'counting-sort',
    name: 'Counting Sort',
    category: 'sorting',
    timeComplexity: { best: 'O(n+k)', average: 'O(n+k)', worst: 'O(n+k)' },
    spaceComplexity: 'O(k)',
    stable: true,
    description: 'Counts occurrences of each value, then reconstructs the sorted array.',
    visualization: 'counting',
    path: '/array/sorting/counting-sort'
  },
  {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'searching',
    timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(1)',
    stable: true,
    description: 'Searches for an element by checking each element sequentially.',
    visualization: 'bars',
    path: '/array/searching/linear-search'
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'searching',
    timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(1)',
    stable: true,
    description: 'Searches for an element by repeatedly dividing the search space in half.',
    visualization: 'bars',
    path: '/array/searching/binary-search'
  }
];

export const getAlgorithmById = (id) => {
  return algorithms.find(algo => algo.id === id);
};

export const getAlgorithmsByCategory = (category) => {
  return algorithms.filter(algo => algo.category === category);
};
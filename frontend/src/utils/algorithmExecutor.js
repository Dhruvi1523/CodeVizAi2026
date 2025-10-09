// import { AlgorithmStep } from '../types';
import { bubbleSort, selectionSort, insertionSort, mergeSort, quickSort, heapSort, countingSort } from '../algorithms/sortingAlgorithms';
import { linearSearch, binarySearch } from '../algorithms/searchingAlgorithms';

export const executeAlgorithm = (
  algorithmId,
  array,
  target
) => {
  let generator;
  
  switch (algorithmId) {
    case 'bubble-sort':
      generator = bubbleSort(array);
      break;
    case 'selection-sort':
      generator = selectionSort(array);
      break;
    case 'insertion-sort':
      generator = insertionSort(array);
      break;
    case 'merge-sort':
      generator = mergeSort(array);
      break;
    case 'quick-sort':
      generator = quickSort(array);
      break;
    case 'heap-sort':
      generator = heapSort(array);
      break;
    case 'counting-sort':
      generator = countingSort(array);
      break;
    case 'linear-search':
      const linearTarget = target !== undefined ? target : array[Math.floor(Math.random() * array.length)];
      generator = linearSearch(array, linearTarget);
      break;
    case 'binary-search':
      const binaryTarget = target !== undefined ? target : array[Math.floor(Math.random() * array.length)];
      generator = binarySearch(array, binaryTarget);
      break;
    default:
      throw new Error(`Algorithm ${algorithmId} not implemented`);
  }
  
  const steps = [];
  let result = generator.next();
  
  while (!result.done) {
    steps.push(result.value);
    result = generator.next();
  }
  
  return steps;
};

export const getStepDescription = (step, algorithmId) => {
  switch (step.action) {
    case 'compare':
      if (algorithmId.includes('search')) {
        return step.comparing && step.comparing.length === 3 
          ? `Comparing middle element ${step.current} with target`
          : `Checking element at index ${step.current}`;
      }
      return step.comparing 
        ? `Comparing elements at indices ${step.comparing.join(' and ')}`
        : 'Comparing elements';
    
    case 'swap':
      return step.swapped 
        ? `Swapping elements at indices ${step.swapped.join(' and ')}`
        : 'Swapping elements';
    
    case 'split':
      return `Splitting array into left and right subarrays`;
    
    case 'merge-step':
      return `Merging elements back together`;
    
    case 'merge-complete':
      return `Completed merging at depth ${step.depth}`;
    
    case 'select-pivot':
      return `Selected pivot element at index ${step.pivot}`;
    
    case 'place-pivot':
      return `Placed pivot in correct position`;
    
    case 'extract-max':
      return `Extracted maximum element from heap`;
    
    case 'found':
      return `Found target element at index ${step.current}!`;
    
    case 'not-found':
      return `Target element not found in array`;
    
    case 'search-left':
      return `Target is smaller, searching left half`;
    
    case 'search-right':
      return `Target is larger, searching right half`;
    
    case 'done':
      return 'Algorithm completed successfully!';
    
    default:
      return 'Processing...';
  }
};
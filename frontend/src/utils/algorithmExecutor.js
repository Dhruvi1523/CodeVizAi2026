// /src/utils/algorithmExecutor.js

import { bubbleSort, 
  selectionSort, 
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
 
} from "../algorithms/sortingAlgorithms.js";

import { 
   linearSearch,
  binarySearch
} from "../algorithms/searchingAlgorithms.js";


export function executeAlgorithm(algorithmId, array, target) {
  switch (algorithmId) {
    case "bubble-sort":
      return Array.from(bubbleSort([...array]));
    case "selection-sort":
      return Array.from(selectionSort([...array]));
    case "insertion-sort":
      return Array.from(insertionSort([...array]));
    case "merge-sort":
      return Array.from(mergeSort([...array]));
    case "quick-sort":
      return Array.from(quickSort([...array]));
    case "heap-sort":
      return Array.from(heapSort([...array]));
    case "linear-search":
      return Array.from(linearSearch([...array], target));
    case "binary-search":
      return Array.from(binarySearch([...array], target));
    default:
      throw new Error(`Unknown algorithm: ${algorithmId}`);
  }
}

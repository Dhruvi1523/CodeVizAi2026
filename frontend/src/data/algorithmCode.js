export const algorithmCode = {
  'bubble-sort': `function bubbleSort(arr) {
  let n = arr.length;
  
  for (let i = 0; i < n; i++) {
    let swapped = false;
    
    for (let j = 0; j < n - i - 1; j++) {
      // Compare adjacent elements
      if (arr[j] > arr[j + 1]) {
        // Swap if they are in wrong order
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    
    // If no swapping occurred, array is sorted
    if (!swapped) break;
  }
  
  return arr;
}

// Time Complexity: O(n²)
// Space Complexity: O(1)
// Stable: Yes`,

  'selection-sort': `function selectionSort(arr) {
  let n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    // Find minimum element in remaining array
    let minIndex = i;
    
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }
    
    // Swap minimum element with first element
    if (minIndex !== i) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
    }
  }
  
  return arr;
}

// Time Complexity: O(n²)
// Space Complexity: O(1)
// Stable: No`,

  'insertion-sort': `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    
    // Move elements greater than key one position ahead
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    
    // Insert key at correct position
    arr[j + 1] = key;
  }
  
  return arr;
}

// Time Complexity: O(n²)
// Space Complexity: O(1)
// Stable: Yes`,

  'merge-sort': `function mergeSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }
  
  // Divide array into two halves
  const mid = Math.floor(arr.length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);
  
  // Recursively sort both halves
  const sortedLeft = mergeSort(left);
  const sortedRight = mergeSort(right);
  
  // Merge sorted halves
  return merge(sortedLeft, sortedRight);
}

function merge(left, right) {
  let result = [];
  let i = 0, j = 0;
  
  // Compare elements and merge in sorted order
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  // Add remaining elements
  return result.concat(left.slice(i), right.slice(j));
}

// Time Complexity: O(n log n)
// Space Complexity: O(n)
// Stable: Yes`,

  'quick-sort': `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    // Partition array and get pivot index
    let pivotIndex = partition(arr, low, high);
    
    // Recursively sort elements before and after partition
    quickSort(arr, low, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, high);
  }
  
  return arr;
}

function partition(arr, low, high) {
  // Choose rightmost element as pivot
  let pivot = arr[high];
  let i = low - 1;
  
  for (let j = low; j < high; j++) {
    // If current element is smaller than or equal to pivot
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  // Place pivot in correct position
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}

// Time Complexity: O(n log n) avg, O(n²) worst
// Space Complexity: O(log n)
// Stable: No`,

  'heap-sort': `function heapSort(arr) {
  let n = arr.length;
  
  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }
  
  // Extract elements one by one from heap
  for (let i = n - 1; i > 0; i--) {
    // Move current root to end
    [arr[0], arr[i]] = [arr[i], arr[0]];
    
    // Call heapify on reduced heap
    heapify(arr, i, 0);
  }
  
  return arr;
}

function heapify(arr, n, i) {
  let largest = i;
  let left = 2 * i + 1;
  let right = 2 * i + 2;
  
  // Find largest among root, left child and right child
  if (left < n && arr[left] > arr[largest]) {
    largest = left;
  }
  
  if (right < n && arr[right] > arr[largest]) {
    largest = right;
  }
  
  // If largest is not root, swap and continue heapifying
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}

// Time Complexity: O(n log n)
// Space Complexity: O(1)
// Stable: No`,

  'linear-search': `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    // Check each element sequentially
    if (arr[i] === target) {
      return i; // Return index if found
    }
  }
  
  return -1; // Return -1 if not found
}

// Example usage:
// let arr = [64, 34, 25, 12, 22, 11, 90];
// let target = 22;
// let result = linearSearch(arr, target);
// 
// if (result !== -1) {
//   console.log(\`Element found at index \${result}\`);
// } else {
//   console.log("Element not found");
// }

// Time Complexity: O(n)
// Space Complexity: O(1)
// Best for: Unsorted arrays, small datasets`,

  'binary-search': `function binarySearch(arr, target) {
  // Array must be sorted for binary search
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    // Find middle point
    let mid = Math.floor((left + right) / 2);
    
    // If target is found at mid
    if (arr[mid] === target) {
      return mid;
    }
    
    // If target is greater, ignore left half
    if (arr[mid] < target) {
      left = mid + 1;
    }
    // If target is smaller, ignore right half
    else {
      right = mid - 1;
    }
  }
  
  return -1; // Element not found
}

// Example usage:
// let arr = [11, 12, 22, 25, 34, 64, 90]; // Must be sorted
// let target = 22;
// let result = binarySearch(arr, target);

// Time Complexity: O(log n)
// Space Complexity: O(1)
// Requirement: Array must be sorted`
};

export const getAlgorithmCode = (algorithmId) => {
  return algorithmCode[algorithmId] || 'Code not available';
};
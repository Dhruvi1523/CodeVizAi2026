export function* bubbleSort(arr) {
  const array = [...arr];
  const n = array.length;
  
  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      yield { 
        action: 'compare', 
        array: [...array], 
        comparing: [j, j + 1],
        sorted: Array.from({ length: i }, (_, k) => n - 1 - k)
      };
      
      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        swapped = true;
        yield { 
          action: 'swap', 
          array: [...array], 
          swapped: [j, j + 1],
          sorted: Array.from({ length: i }, (_, k) => n - 1 - k)
        };
      }
    }
    if (!swapped) break;
  }
  
  yield { 
    action: 'done', 
    array: [...array], 
    sorted: Array.from({ length: n }, (_, i) => i)
  };
}

export function* selectionSort(arr) {
  const array = [...arr];
  const n = array.length;
  
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    
    for (let j = i + 1; j < n; j++) {
      yield { 
        action: 'compare', 
        array: [...array], 
        comparing: [minIdx, j],
        sorted: Array.from({ length: i }, (_, k) => k)
      };
      
      if (array[j] < array[minIdx]) {
        minIdx = j;
      }
    }
    
    if (minIdx !== i) {
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
      yield { 
        action: 'swap', 
        array: [...array], 
        swapped: [i, minIdx],
        sorted: Array.from({ length: i + 1 }, (_, k) => k)
      };
    }
  }
  
  yield { 
    action: 'done', 
    array: [...array], 
    sorted: Array.from({ length: n }, (_, i) => i)
  };
}

export function* insertionSort(arr) {
  const array = [...arr];
  
  for (let i = 1; i < array.length; i++) {
    const key = array[i];
    let j = i - 1;
    
    yield { 
      action: 'select', 
      array: [...array], 
      comparing: [i],
      sorted: Array.from({ length: i }, (_, k) => k)
    };
    
    while (j >= 0 && array[j] > key) {
      yield { 
        action: 'compare', 
        array: [...array], 
        comparing: [j, j + 1]
      };
      
      array[j + 1] = array[j];
      j--;
      
      yield { 
        action: 'shift', 
        array: [...array], 
        comparing: [j + 2]
      };
    }
    
    array[j + 1] = key;
    yield { 
      action: 'insert', 
      array: [...array], 
      sorted: Array.from({ length: i + 1 }, (_, k) => k)
    };
  }
  
  yield { 
    action: 'done', 
    array: [...array], 
    sorted: Array.from({ length: array.length }, (_, i) => i)
  };
}

export function* quickSort(arr, low = 0, high = arr.length - 1) {
  const array = [...arr];
  
  if (low < high) {
    const pivotIndex = yield* partition(array, low, high);
    yield* quickSort(array, low, pivotIndex - 1);
    yield* quickSort(array, pivotIndex + 1, high);
  }
  
  if (low === 0 && high === arr.length - 1) {
    yield { 
      action: 'done', 
      array: [...array], 
      sorted: Array.from({ length: array.length }, (_, i) => i)
    };
  }
}

function* partition(array, low, high) {
  const pivot = array[high];
  let i = low - 1;
  
  yield { 
    action: 'select-pivot', 
    array: [...array], 
    pivot: high 
  };
  
  for (let j = low; j < high; j++) {
    yield { 
      action: 'compare', 
      array: [...array], 
      comparing: [j, high],
      pivot: high
    };
    
    if (array[j] <= pivot) {
      i++;
      if (i !== j) {
        [array[i], array[j]] = [array[j], array[i]];
        yield { 
          action: 'swap', 
          array: [...array], 
          swapped: [i, j],
          pivot: high
        };
      }
    }
  }
  
  [array[i + 1], array[high]] = [array[high], array[i + 1]];
  yield { 
    action: 'place-pivot', 
    array: [...array], 
    swapped: [i + 1, high],
    partitionIndex: i + 1
  };
  
  return i + 1;
}

export function* mergeSort(arr, depth = 0) {
  if (arr.length <= 1) {
    yield { action: 'return', array: [...arr], depth };
    return arr;
  }

  const mid = Math.floor(arr.length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);

  yield { action: 'split', array: [...arr], left, right, depth };

  const sortedLeft = yield* mergeSort(left, depth + 1);
  const sortedRight = yield* mergeSort(right, depth + 1);

  const merged = [];
  let i = 0, j = 0;

  while (i < sortedLeft.length && j < sortedRight.length) {
    yield { 
      action: 'compare', 
      array: [...merged], 
      comparing: [sortedLeft[i], sortedRight[j]], 
      depth,
      left: sortedLeft,
      right: sortedRight
    };
    
    if (sortedLeft[i] <= sortedRight[j]) {
      merged.push(sortedLeft[i++]);
    } else {
      merged.push(sortedRight[j++]);
    }
    
    yield { 
      action: 'merge-step', 
      array: [...merged], 
      merged: [...merged], 
      depth,
      left: sortedLeft,
      right: sortedRight
    };
  }

  while (i < sortedLeft.length) {
    merged.push(sortedLeft[i++]);
    yield { 
      action: 'merge-step', 
      array: [...merged], 
      merged: [...merged], 
      depth 
    };
  }
  
  while (j < sortedRight.length) {
    merged.push(sortedRight[j++]);
    yield { 
      action: 'merge-step', 
      array: [...merged], 
      merged: [...merged], 
      depth 
    };
  }

  yield { action: 'merge-complete', array: [...merged], merged: [...merged], depth };
  return merged;
}

export function* heapSort(arr) {
  const array = [...arr];
  const n = array.length;

  // Build heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(array, n, i);
  }

  // Extract elements one by one
  for (let i = n - 1; i > 0; i--) {
    [array[0], array[i]] = [array[i], array[0]];
    yield { 
      action: 'extract-max', 
      array: [...array], 
      swapped: [0, i],
      sorted: Array.from({ length: n - i }, (_, k) => n - 1 - k)
    };
    
    yield* heapify(array, i, 0);
  }

  yield { 
    action: 'done', 
    array: [...array], 
    sorted: Array.from({ length: n }, (_, i) => i)
  };
}

function* heapify(array, n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < n) {
    yield { 
      action: 'compare', 
      array: [...array], 
      comparing: [largest, left] 
    };
    if (array[left] > array[largest]) {
      largest = left;
    }
  }

  if (right < n) {
    yield { 
      action: 'compare', 
      array: [...array], 
      comparing: [largest, right] 
    };
    if (array[right] > array[largest]) {
      largest = right;
    }
  }

  if (largest !== i) {
    [array[i], array[largest]] = [array[largest], array[i]];
    yield { 
      action: 'swap', 
      array: [...array], 
      swapped: [i, largest] 
    };
    yield* heapify(array, n, largest);
  } else {
    yield { action: 'heapify-done', array: [...array], index: i };
  }
} 

// Counting Sort generator for visualization
export function* countingSort(arr) {
  const array = [...arr];
  if (!array.length) return;

  const max = Math.max(...array);
  const min = Math.min(...array);
  const range = max - min + 1;
  const count = Array(range).fill(0);
  const output = Array(array.length).fill(0);

  // --- Step 1: Count occurrences ---
  for (let i = 0; i < array.length; i++) {
    const val = array[i];
    count[val - min]++;
    yield {
      phase: "counting",
      array: [...array],
      count: [...count],
      output: [...output],
      currentIndex: i,
      currentValue: val,
      countIndex: val - min
    };
  }

  // --- Step 2: Cumulative count ---
  for (let i = 1; i < count.length; i++) {
    count[i] += count[i - 1];
    yield {
      phase: "cumulative",
      array: [...array],
      count: [...count],
      output: [...output],
      countIndex: i
    };
  }

  // --- Step 3: Build output array ---
  for (let i = array.length - 1; i >= 0; i--) {
    const val = array[i];
    const idx = count[val - min] - 1;
    output[idx] = val;
    count[val - min]--;
    yield {
      phase: "output",
      array: [...array],
      count: [...count],
      output: [...output],
      currentIndex: i,
      currentValue: val,
      outputIndex: idx,
      countIndex: val - min
    };
  }

  // --- Done ---
  yield {
    phase: "done",
    array: [...output],
    count: [...count],
    output: [...output]
  };
}


// sortingAlgorithms.js
export function* bubbleSort(arr) {
  const deep = (a) => JSON.parse(JSON.stringify(a));
  const getVal = (v) => (v !== null && typeof v === 'object' && 'value' in v ? v.value : v);

  const array = deep(arr);
  const n = array.length;

  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      const left = getVal(array[j]);
      const right = getVal(array[j + 1]);
      const compResult = left > right;

      yield {
        action: 'compare',
        array: deep(array),
        comparing: [j, j + 1],
        comparison: { left, right, operator: '>', result: compResult },
        explanation: `Compare ${left} and ${right}: ${compResult ? 'true → they will be swapped' : 'false → no swap'}`,
        sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
      };

      if (compResult) {
        // perform swap
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        swapped = true;

        yield {
          action: 'swap',
          array: deep(array),
          swapped: [j, j + 1],
          explanation: `Swapped ${left} and ${right}`,
          sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
        };
      }
    }

    if (!swapped) break;
  }

  yield {
    action: 'done',
    array: deep(array),
    explanation: 'Array sorted.',
    sorted: Array.from({ length: n }, (_, i) => i),
  };
}

export function* selectionSort(arr) {
  const deep = (a) => JSON.parse(JSON.stringify(a));
  const getVal = (v) => (v !== null && typeof v === 'object' && 'value' in v ? v.value : v);

  const array = deep(arr);
  const n = array.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    for (let j = i + 1; j < n; j++) {
      const candidate = getVal(array[j]);
      const currentMin = getVal(array[minIdx]);
      const compResult = candidate < currentMin;

      yield {
        action: 'compare',
        array: deep(array),
        comparing: [minIdx, j],
        comparison: { left: currentMin, right: candidate, operator: '<', result: compResult },
        explanation: `Is candidate ${candidate} < current min ${currentMin}? ${compResult ? 'yes → update min' : 'no'}`,
        sorted: Array.from({ length: i }, (_, k) => k),
      };

      if (compResult) {
        minIdx = j;
        yield {
          action: 'minUpdate',
          array: deep(array),
          minIndex: minIdx,
          explanation: `New minimum found at index ${minIdx} (${candidate})`,
          sorted: Array.from({ length: i }, (_, k) => k),
        };
      }
    }

    if (minIdx !== i) {
      const a = getVal(array[i]);
      const b = getVal(array[minIdx]);
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
      yield {
        action: 'swap',
        array: deep(array),
        swapped: [i, minIdx],
        explanation: `Swap ${b} (new min) with ${a} at index ${i}`,
        sorted: Array.from({ length: i + 1 }, (_, k) => k),
      };
    } else {
      // no swap, but we can still mark that i is finalized
      yield {
        action: 'noSwap',
        array: deep(array),
        explanation: `Position ${i} already has the minimum (${getVal(array[i])}).`,
        sorted: Array.from({ length: i + 1 }, (_, k) => k),
      };
    }
  }

  yield {
    action: 'done',
    array: deep(array),
    explanation: 'Array sorted.',
    sorted: Array.from({ length: n }, (_, i) => i),
  };
}

export function* insertionSort(arr) {
  const deep = (a) => JSON.parse(JSON.stringify(a));
  const getVal = (v) => (v !== null && typeof v === 'object' && 'value' in v ? v.value : v);

  const array = deep(arr);
  const n = array.length;

  // initial state
  yield { action: 'start', array: deep(array), explanation: 'Start insertion sort', sorted: [] };

  for (let i = 1; i < n; i++) {
    const keyItem = array[i];
    const keyVal = getVal(keyItem);
    let j = i - 1;

    // pick up key -> create a hole
    array[i] = null;
    yield {
      action: 'pickup',
      array: deep(array),
      keyInHand: { value: keyVal, originalIndex: i },
      explanation: `Picked key ${keyVal} from index ${i}. Create a hole at index ${i}.`,
      sorted: Array.from({ length: i }, (_, k) => k),
    };

    // shift items right while they are greater than key
    while (j >= 0 && array[j] !== null && getVal(array[j]) > keyVal) {
      const leftVal = getVal(array[j]);
      const compResult = leftVal > keyVal;

      // comparison (single index — compare array[j] with key)
      yield {
        action: 'compare',
        array: deep(array),
        comparing: [j],
        comparison: { left: leftVal, right: keyVal, operator: '>', result: compResult },
        explanation: `Compare ${leftVal} (index ${j}) > ${keyVal} (key)? ${compResult ? 'yes → shift right' : 'no → stop'}`,
        sorted: Array.from({ length: i }, (_, k) => k),
      };

      // perform shift
      array[j + 1] = array[j];
      array[j] = null;
      yield {
        action: 'shift',
        array: deep(array),
        shifted: { from: j, to: j + 1, value: leftVal, reason: `${leftVal} > ${keyVal}` },
        keyInHand: { value: keyVal, originalIndex: i },
        explanation: `Shifted ${leftVal} from ${j} to ${j + 1} because ${leftVal} > ${keyVal}.`,
        sorted: Array.from({ length: i }, (_, k) => k),
      };

      j--;
    }

    // place the key into final position j+1
    array[j + 1] = keyItem;
    yield {
      action: 'place',
      array: deep(array),
      placed: { index: j + 1, value: keyItem },
      explanation: `Placed key ${keyVal} at index ${j + 1}.`,
      sorted: Array.from({ length: i + 1 }, (_, k) => k),
    };
  }

  yield {
    action: 'done',
    array: deep(array),
    explanation: 'Array sorted.',
    sorted: Array.from({ length: n }, (_, i) => i),
  };
}


let nodeCounter = 0;
const newNodeId = () => `node-${++nodeCounter}`;

export function* quickSort(arr, low = 0, high = arr.length - 1, depth = 0, parentId = null, finalizedSet = new Set()) {
  const array = [...arr];
  const nodeId = `node-${Math.random().toString(36).substr(2, 9)}`;

  // Only yield meaningful subarrays
  if (high <= low) {
    if (low === high) finalizedSet.add(low); // single element is placed
    yield {
      action: "done-node",
      nodeId,
      array: [...array],
      depth,
      low,
      high,
      finalized: Array.from(finalizedSet),
    };
    return;
  }

  const pivotIndex = high;
  const pivotValue = array[pivotIndex];
  let i = low - 1;

  // Partition visualization
  yield {
    action: "partition",
    nodeId,
    array: [...array],
    pivotIndex,
    low,
    high,
    depth,
    finalized: Array.from(finalizedSet),
  };

  // Select pivot
  yield {
    action: "select-pivot",
    nodeId,
    array: [...array],
    pivotIndex,
    low,
    high,
    depth,
    finalized: Array.from(finalizedSet),
  };

  for (let j = low; j < high; j++) {
    yield {
      action: "compare",
      nodeId,
      array: [...array],
      comparing: [j, pivotIndex],
      pivotIndex,
      low,
      high,
      depth,
      finalized: Array.from(finalizedSet),
    };

    if (array[j] <= pivotValue) {
      i++;
      if (i !== j) {
        [array[i], array[j]] = [array[j], array[i]];
        yield {
          action: "swap",
          nodeId,
          array: [...array],
          swapped: [i, j],
          pivotIndex,
          low,
          high,
          depth,
          finalized: Array.from(finalizedSet),
        };
      }
    }
  }

  // Place pivot
  [array[i + 1], array[high]] = [array[high], array[i + 1]];
  finalizedSet.add(i + 1); // mark pivot index as finalized

  yield {
    action: "place-pivot",
    nodeId,
    array: [...array],
    swapped: [i + 1, high],
    pivotIndex: i + 1,
    low,
    high,
    depth,
    finalized: Array.from(finalizedSet),
  };

  // Recurse left
  yield* quickSort(array, low, i, depth + 1, nodeId, finalizedSet);
  // Recurse right
  yield* quickSort(array, i + 2, high, depth + 1, nodeId, finalizedSet);

  // Done node
  yield {
    action: "done-node",
    nodeId,
    array: [...array],
    low,
    high,
    depth,
    finalized: Array.from(finalizedSet),
  };

  // Final done
  if (low === 0 && high === arr.length - 1 && depth === 0) {
    yield { action: "done", nodeId, array: [...array], finalized: Array.from(finalizedSet) };
  }
}




// The startIndex parameter is added to track the position in the original array
// Merge Sort Generator with step-by-step merge animation
export function* mergeSort(arr, depth = 0, startIndex = 0) {
  if (arr.length <= 1) {
    yield {
      action: "base",
      array: [...arr],
      range: [startIndex, startIndex + arr.length - 1],
      depth,
    };
    return arr;
  }

  const mid = Math.floor(arr.length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);

  // Split step
  yield {
    action: "split",
    array: [...arr],
    left,
    right,
    range: [startIndex, startIndex + arr.length - 1],
    depth,
  };

  const sortedLeft = yield* mergeSort(left, depth + 1, startIndex);
  const sortedRight = yield* mergeSort(right, depth + 1, startIndex + mid);

  // Merge phase
  const merged = [];
  let li = 0,
    ri = 0;

  while (li < sortedLeft.length && ri < sortedRight.length) {
    // highlight compare
    yield {
      action: "compare",
      left: { array: sortedLeft, index: li },
      right: { array: sortedRight, index: ri },
      merged: [...merged],
      range: [startIndex, startIndex + arr.length - 1],
      depth,
    };

    if (sortedLeft[li] <= sortedRight[ri]) {
      merged.push(sortedLeft[li++]);
    } else {
      merged.push(sortedRight[ri++]);
    }

    // after placing element
    yield {
      action: "merge-step",
      left: { array: sortedLeft, index: li },
      right: { array: sortedRight, index: ri },
      merged: [...merged],
      range: [startIndex, startIndex + arr.length - 1],
      depth,
    };
  }

  // leftover left elements
  while (li < sortedLeft.length) {
    merged.push(sortedLeft[li++]);
    yield {
      action: "merge-step",
      left: { array: sortedLeft, index: li },
      right: { array: sortedRight, index: ri },
      merged: [...merged],
      range: [startIndex, startIndex + arr.length - 1],
      depth,
    };
  }

  // leftover right elements
  while (ri < sortedRight.length) {
    merged.push(sortedRight[ri++]);
    yield {
      action: "merge-step",
      left: { array: sortedLeft, index: li },
      right: { array: sortedRight, index: ri },
      merged: [...merged],
      range: [startIndex, startIndex + arr.length - 1],
      depth,
    };
  }

  // final merged array at this depth
  yield {
    action: "merge-complete",
    array: [...merged],
    range: [startIndex, startIndex + arr.length - 1],
    depth,
  };

  return merged;
}






export function* heapSort(arr) {
  const array = [...arr];
  const n = array.length;
  const sorted = [];

  // helper to get all descendants of a node
  const getSubtreeIndices = (root, size) => {
    const indices = [];
    const stack = [root];
    while (stack.length) {
      const i = stack.pop();
      if (i < size) {
        indices.push(i);
        stack.push(2 * i + 1, 2 * i + 2);
      }
    }
    return indices;
  };

  function* heapify(n, i, phase = "heapify") {
    const subtreeIndices = getSubtreeIndices(i, n);
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    // --- Compare with left child
    if (left < n) {
      yield {
        action: "compare",
        phase,
        array: [...array],
        comparing: [i, left],
        heapifyRoot: i,
        heapifySubtree: subtreeIndices,
        sorted: [...sorted],
        explanation: `Comparing parent (${array[i]}) with left child (${array[left]}) to find the larger value.`,
      };
      if (array[left] > array[largest]) largest = left;
    }

    // --- Compare with right child
    if (right < n) {
      yield {
        action: "compare",
        phase,
        array: [...array],
        comparing: [largest, right],
        heapifyRoot: i,
        heapifySubtree: subtreeIndices,
        sorted: [...sorted],
        explanation: `Comparing current largest (${array[largest]}) with right child (${array[right]}) to maintain max-heap property.`,
      };
      if (array[right] > array[largest]) largest = right;
    }

    // --- Swap if necessary
    if (largest !== i) {
      [array[i], array[largest]] = [array[largest], array[i]];
      yield {
        action: "swap",
        phase,
        array: [...array],
        swapped: [i, largest],
        heapifyRoot: i,
        heapifySubtree: subtreeIndices,
        sorted: [...sorted],
        explanation: `Swapping ${array[largest]} with ${array[i]} to restore the heap property.`,
      };

      // Recursive heapify
      yield* heapify(n, largest, phase);
    }
  }

  // --- Build the heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    const subtreeIndices = getSubtreeIndices(i, n);
    yield {
      action: "phase-change",
      phase: "build",
      array: [...array],
      heapifyRoot: i,
      heapifySubtree: subtreeIndices,
      sorted: [...sorted],
      explanation: `Building heap: starting heapify at index ${i} (${array[i]}).`,
    };
    yield* heapify(n, i, "build");
  }

  // --- Extract elements one by one
  for (let i = n - 1; i > 0; i--) {
    [array[0], array[i]] = [array[i], array[0]];
    sorted.push(i);
    yield {
      action: "extract-max",
      phase: "extract",
      array: [...array],
      swapped: [0, i],
      sorted: [...sorted],
      explanation: `Extracting the largest element (${array[i]}) to its final position.`,
    };

    yield* heapify(i, 0, "heapify");
  }

  sorted.push(0);
  yield {
    action: "done",
    phase: "sorted",
    array: [...array],
    sorted: [...sorted],
    explanation: `✅ All elements are now sorted in ascending order.`,
  };
}


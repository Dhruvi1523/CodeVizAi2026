
/** ✅ Linear Search */
export function* linearSearch(array, target) {
  for (let i = 0; i < array.length; i++) {
    yield { action: "compare", array: [...array], comparing: [i], target };
    if (array[i] === target) {
      yield { action: "found", array: [...array], index: i };
      return i;
    }
  }
  yield { action: "not-found", array: [...array], target };
  return -1;
}

/** ✅ Binary Search */
export function* binarySearch(array, target) {
  let low = 0;
  let high = array.length - 1;

  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    yield { action: "compare", array: [...array], comparing: [mid], target };

    if (array[mid] === target) {
      yield { action: "found", array: [...array], index: mid };
      return mid;
    } else if (array[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  yield { action: "not-found", array: [...array], target };
  return -1;
}

// linearSearch.js
export function* linearSearch(arr, target) {

  
  const array = [...arr];
  if(target == null){
    yield{
      array: [...array],
      explanation : "Target is null. Please enter a target value."
    }
    return ;
  }
  for (let i = 0; i < array.length; i++) {
    yield {
      action: "compare",
      array: [...array],
      comparing: [i],
      target: target,
      explanation: `Comparing element at index ${i} (${array[i]}) with target (${target}).`,
    };

    if (array[i] === target) {
      yield {
        action: "found",
        array: [...array],
        foundIndex: i,
        explanation: `Target ${target} found at index ${i}!`,
      };
      return;
    }
  }

  yield {
    action: "not-found",
    array: [...array],
    explanation: `Target ${target} not found in array.`,
  };
}

export function* binarySearch(arr, target) {
  // Sort the array for binary search
  const array = [...arr].sort((a, b) => a - b);

  if(target == null){
    yield{
      array: [...array],
      explanation : "Target is null. Please enter a target value."
    }
    return ;
  }

  // Initial left and right pointers
  let left = 0;
  let right = array.length - 1;

  // Initial step: show entire array
  yield {
    action: 'init',
    array: [...array],
    comparing: [left, right],
    explanation: `Start binary search on sorted array. Left pointer at index ${left}, Right pointer at index ${right}.`
  };

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    // Step: select the middle element
    yield {
      action: 'select-mid',
      array: [...array],
      comparing: [left, mid, right],
      current: mid,
      target : target,
      explanation: `Middle element chosen at index ${mid} with value ${array[mid]}.`
    };

    if (array[mid] === target) {
      yield {
        action: 'found',
        array: [...array],
        current: mid,
        found: true,
        target: target,
        explanation: `Target ${target} found at index ${mid}.`
      };
      return;
    }

    if (array[mid] < target) {
      left = mid + 1;
      yield {
        action: 'search-right',
        array: [...array],
        comparing: [left, right],
        target : target ,
        explanation: `Target ${target} is greater than ${array[mid]}. Searching right half: indices ${left} to ${right}.`
      };
    } else {
      right = mid - 1;
      yield {
        action: 'search-left',
        array: [...array],
        comparing: [left, right],
        target: target ,
        explanation: `Target ${target} is less than ${array[mid]}. Searching left half: indices ${left} to ${right}.`
      };
    }
  }

  // Target not found
  yield {
    action: 'not-found',
    array: [...array],
    found: false,
    explanation: `Target ${target} not found in array.`
  };
}

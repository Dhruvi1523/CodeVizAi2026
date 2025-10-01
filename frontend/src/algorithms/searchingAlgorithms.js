// import { AlgorithmStep } from '../types';

export function* linearSearch(arr, target) {
  const array = [...arr];
  
  for (let i = 0; i < array.length; i++) {
    yield { 
      action: 'compare', 
      array: [...array], 
      comparing: [i],
      current: i
    };
    
    if (array[i] === target) {
      yield { 
        action: 'found', 
        array: [...array], 
        current: i,
        found: true
      };
      return;
    }
  }
  
  yield { 
    action: 'not-found', 
    array: [...array], 
    found: false
  };
}

export function* binarySearch(arr, target) {
  // First, we need to sort the array for binary search
  const array = [...arr].sort((a, b) => a - b);
  let left = 0;
  let right = array.length - 1;
  
  yield { 
    action: 'init', 
    array: [...array], 
    comparing: [left, right]
  };
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    yield { 
      action: 'select-mid', 
      array: [...array], 
      comparing: [left, mid, right],
      current: mid
    };
    
    if (array[mid] === target) {
      yield { 
        action: 'found', 
        array: [...array], 
        current: mid,
        found: true
      };
      return;
    }
    
    if (array[mid] < target) {
      left = mid + 1;
      yield { 
        action: 'search-right', 
        array: [...array], 
        comparing: [left, right]
      };
    } else {
      right = mid - 1;
      yield { 
        action: 'search-left', 
        array: [...array], 
        comparing: [left, right]
      };
    }
  }
  
  yield { 
    action: 'not-found', 
    array: [...array], 
    found: false
  };
}
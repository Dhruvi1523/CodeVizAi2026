export const algorithmCode = {
  'bubble-sort': `def bubble_sort(arr):
    n = len(arr)
    
    for i in range(n):
        swapped = False
        
        for j in range(n - i - 1):
            # Compare adjacent elements
            if arr[j] > arr[j + 1]:
                # Swap if they are in wrong order
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        
        # If no swapping occurred, array is sorted
        if not swapped:
            break
    
    return arr

# Time Complexity: O(n²)
# Space Complexity: O(1)
# Stable: Yes`,

  'selection-sort': `def selection_sort(arr):
    n = len(arr)
    
    for i in range(n - 1):
        # Find minimum element in remaining array
        min_index = i
        
        for j in range(i + 1, n):
            if arr[j] < arr[min_index]:
                min_index = j
        
        # Swap minimum element with first element
        if min_index != i:
            arr[i], arr[min_index] = arr[min_index], arr[i]
    
    return arr

# Time Complexity: O(n²)
# Space Complexity: O(1)
# Stable: No`,

  'insertion-sort': `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        
        # Move elements greater than key one position ahead
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        
        # Insert key at correct position
        arr[j + 1] = key
    
    return arr

# Time Complexity: O(n²)
# Space Complexity: O(1)
# Stable: Yes`,

  'merge-sort': `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    # Divide array into two halves
    mid = len(arr) // 2
    left = arr[:mid]
    right = arr[mid:]
    
    # Recursively sort both halves
    sorted_left = merge_sort(left)
    sorted_right = merge_sort(right)
    
    # Merge sorted halves
    return merge(sorted_left, sorted_right)

def merge(left, right):
    result = []
    i = j = 0
    
    # Compare elements and merge in sorted order
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    # Add remaining elements
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# Time Complexity: O(n log n)
# Space Complexity: O(n)
# Stable: Yes`,

  'quick-sort': `def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    
    if low < high:
        # Partition array and get pivot index
        pivot_index = partition(arr, low, high)
        
        # Recursively sort elements before and after partition
        quick_sort(arr, low, pivot_index - 1)
        quick_sort(arr, pivot_index + 1, high)
    
    return arr

def partition(arr, low, high):
    # Choose rightmost element as pivot
    pivot = arr[high]
    i = low - 1
    
    for j in range(low, high):
        # If current element is smaller than or equal to pivot
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    
    # Place pivot in correct position
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

# Time Complexity: O(n log n) avg, O(n²) worst
# Space Complexity: O(log n)
# Stable: No`,

  'heap-sort': `def heap_sort(arr):
    n = len(arr)
    
    # Build max heap
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    
    # Extract elements one by one from heap
    for i in range(n - 1, 0, -1):
        # Move current root to end
        arr[0], arr[i] = arr[i], arr[0]
        
        # Call heapify on reduced heap
        heapify(arr, i, 0)
    
    return arr

def heapify(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    
    # Find largest among root, left child and right child
    if left < n and arr[left] > arr[largest]:
        largest = left
    
    if right < n and arr[right] > arr[largest]:
        largest = right
    
    # If largest is not root, swap and continue heapifying
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

# Time Complexity: O(n log n)
# Space Complexity: O(1)
# Stable: No`,

  'linear-search': `def linear_search(arr, target):
    for i in range(len(arr)):
        # Check each element sequentially
        if arr[i] == target:
            return i  # Return index if found
    
    return -1  # Return -1 if not found

# Example usage:
# arr = [64, 34, 25, 12, 22, 11, 90]
# target = 22
# result = linear_search(arr, target)
# 
# if result != -1:
#     print(f"Element found at index {result}")
# else:
#     print("Element not found")

# Time Complexity: O(n)
# Space Complexity: O(1)
# Best for: Unsorted arrays, small datasets`,

  'binary-search': `def binary_search(arr, target):
    # Array must be sorted for binary search
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        # Find middle point
        mid = (left + right) // 2
        
        # If target is found at mid
        if arr[mid] == target:
            return mid
        
        # If target is greater, ignore left half
        if arr[mid] < target:
            left = mid + 1
        # If target is smaller, ignore right half
        else:
            right = mid - 1
    
    return -1  # Element not found

# Example usage:
# arr = [11, 12, 22, 25, 34, 64, 90]  # Must be sorted
# target = 22
# result = binary_search(arr, target)

# Time Complexity: O(log n)
# Space Complexity: O(1)
# Requirement: Array must be sorted`
};

export const getAlgorithmCode = (algorithmId) => {
  return algorithmCode[algorithmId] || 'Code not available';
};

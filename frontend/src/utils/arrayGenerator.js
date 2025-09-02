export function generateRandomArray(size, min = 10, max = 400) {
  return Array.from({ length: size }, () => 
    Math.floor(Math.random() * (max - min + 1)) + min
  );
}

export function generateSortedArray(size, min = 10, max = 400) {
  const step = (max - min) / (size - 1);
  return Array.from({ length: size }, (_, i) => 
    Math.floor(min + i * step)
  );
}

export function generateReverseSortedArray(size, min = 10, max = 400) {
  return generateSortedArray(size, min, max).reverse();
}

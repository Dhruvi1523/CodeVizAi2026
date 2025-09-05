import { AlignHorizontalJustifyCenter, Briefcase, CircleDollarSign, BrainCircuit } from 'lucide-react';
export const DP_ALGORITHMS = {
  lcs: {
    name: 'Longest Common Subsequence',
    icon: AlignHorizontalJustifyCenter, 
    inputs: [
      { id: 'str1', label: 'String 1', type: 'text' },
      { id: 'str2', label: 'String 2', type: 'text' },
    ],
    defaultValues: { str1: 'AGGTAB', str2: 'GXTXAYB' },
    problem: 'Given two sequences, find the length of the longest subsequence present in both of them. A subsequence is a sequence that appears in the same relative order, but not necessarily contiguous.',
    logic: 'The value `dp[i][j]` stores the LCS length for `str1[0..i-1]` and `str2[0..j-1]`. If the characters `str1[i-1]` and `str2[j-1]` match, the LCS length is `1 + dp[i-1][j-1]`. If they don\'t match, it\'s the maximum of `dp[i-1][j]` and `dp[i][j-1]`.',
    complexity: { time: 'O(m*n)', space: 'O(m*n)' },
    example: {
      input: "str1 = \"AGGTAB\", str2 = \"GXTXAYB\"",
      output: "The LCS is \"GTAB\", with a length of 4.",
      explanation: "The characters G, T, A, and B appear in that order in both strings."
    }
  },
  knapsack: {
    name: '0/1 Knapsack',
     icon: Briefcase, 
    inputs: [
      { id: 'weights', label: 'Weights (comma-sep)', type: 'text' },
      { id: 'values', label: 'Values (comma-sep)', type: 'text' },
      { id: 'capacity', label: 'Capacity', type: 'number' },
    ],
    defaultValues: { weights: '10,20,30', values: '60,100,120', capacity: 50 },
    problem: 'Given a set of items, each with a weight and a value, determine which items to include in a collection so that the total weight is less than or equal to a given limit and the total value is as large as possible. You can only take one of each item (0/1 property).',
    logic: '`dp[i][w]` is the maximum value using the first `i` items with a capacity of `w`. For each item, we decide whether to include it (if its weight <= w) or exclude it, taking the option that yields the maximum value.',
    complexity: { time: 'O(n*W)', space: 'O(n*W)' },
    example: {
      input: "weights = [10, 20, 30], values = [60, 100, 120], capacity = 50",
      output: "The maximum value is 220.",
      explanation: "By choosing the items with weight 20 (value 100) and weight 30 (value 120), the total weight is 50 and the total value is 220."
    }
  },
  'coin-change': {
    name: 'Coin Change',
    icon: CircleDollarSign, 
    inputs: [
      { id: 'coins', label: 'Coins (comma-sep)', type: 'text' },
      { id: 'amount', label: 'Amount', type: 'number' },
    ],
    defaultValues: { coins: '1,2,5', amount: 11 },
    problem: 'Given a value `V` and an unlimited supply of coins of given denominations, find the minimum number of coins required to make the change.',
    logic: 'The value `dp[i]` stores the minimum number of coins to make an amount `i`. To compute `dp[i]`, we try every coin `c` and check if `1 + dp[i-c]` gives a better (smaller) result than the current `dp[i]`.',
    complexity: { time: 'O(amount*n)', space: 'O(amount)' },
    example: {
      input: "coins = [1, 2, 5], amount = 11",
      output: "The minimum number of coins is 3.",
      explanation: "The optimal combination is two 5-unit coins and one 1-unit coin (5 + 5 + 1 = 11)."
    }
  },
};
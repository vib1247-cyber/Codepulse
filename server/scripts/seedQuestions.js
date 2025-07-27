import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Question from '../models/Question.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Mock user ID for createdBy field
const MOCK_USER_ID = '000000000000000000000001';

// Use the production database
process.env.NODE_ENV = 'development';
process.env.MONGO_URI = 'mongodb://localhost:27017/codepulse';

const problems = [
  {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    difficulty: 'easy',
    sampleInput: 'nums = [2,7,11,15], target = 9',
    sampleOutput: '[0,1]',
    topics: ['Array', 'Hash Table'],
    companies: ['Amazon', 'Google', 'Facebook'],
    link: 'https://leetcode.com/problems/two-sum/',
    testCases: [
      { input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]' }
    ]
  },
  {
    title: 'Add Two Numbers',
    description: 'You are given two non-empty linked lists representing two non-negative integers. Add the two numbers and return the sum as a linked list.',
    difficulty: 'medium',
    sampleInput: 'l1 = [2,4,3], l2 = [5,6,4]',
    sampleOutput: '[7,0,8]',
    topics: ['Linked List', 'Math'],
    companies: ['Amazon', 'Microsoft', 'Apple'],
    link: 'https://leetcode.com/problems/add-two-numbers/',
    testCases: [
      { input: 'l1 = [2,4,3], l2 = [5,6,4]', expectedOutput: '[7,0,8]' },
      { input: 'l1 = [0], l2 = [0]', expectedOutput: '[0]' }
    ]
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    difficulty: 'medium',
    sampleInput: 's = "abcabcbb"',
    sampleOutput: '3',
    topics: ['Hash Table', 'String', 'Sliding Window'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    testCases: [
      { input: 's = "abcabcbb"', expectedOutput: '3' },
      { input: 's = "bbbbb"', expectedOutput: '1' }
    ]
  },
  {
    title: 'Median of Two Sorted Arrays',
    description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
    difficulty: 'hard',
    sampleInput: 'nums1 = [1,3], nums2 = [2]',
    sampleOutput: '2.0',
    topics: ['Array', 'Binary Search', 'Divide and Conquer'],
    companies: ['Google', 'Facebook'],
    link: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
    testCases: [
      { input: 'nums1 = [1,3], nums2 = [2]', expectedOutput: '2.0' },
      { input: 'nums1 = [1,2], nums2 = [3,4]', expectedOutput: '2.5' }
    ]
  },
  {
    title: 'Longest Palindromic Substring',
    description: 'Given a string s, return the longest palindromic substring in s.',
    difficulty: 'medium',
    sampleInput: 's = "babad"',
    sampleOutput: 'bab',
    topics: ['String', 'Dynamic Programming'],
    companies: ['Amazon', 'Microsoft'],
    link: 'https://leetcode.com/problems/longest-palindromic-substring/',
    testCases: [
      { input: 's = "babad"', expectedOutput: 'bab' },
      { input: 's = "cbbd"', expectedOutput: 'bb' }
    ]
  },
  {
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters \'()[]{}\', determine if the input string is valid.',
    difficulty: 'easy',
    sampleInput: 's = "()[]{}"',
    sampleOutput: 'true',
    topics: ['Stack', 'String'],
    companies: ['Amazon', 'Google'],
    link: 'https://leetcode.com/problems/valid-parentheses/',
    testCases: [
      { input: 's = "()[]{}"', expectedOutput: 'true' },
      { input: 's = "(]"', expectedOutput: 'false' }
    ]
  },
  {
    title: 'Merge Two Sorted Lists',
    description: 'Merge two sorted linked lists and return it as a new list.',
    difficulty: 'easy',
    sampleInput: 'l1 = [1,2,4], l2 = [1,3,4]',
    sampleOutput: '[1,1,2,3,4,4]',
    topics: ['Linked List', 'Recursion'],
    companies: ['Facebook', 'Microsoft'],
    link: 'https://leetcode.com/problems/merge-two-sorted-lists/',
    testCases: [
      { input: 'l1 = [1,2,4], l2 = [1,3,4]', expectedOutput: '[1,1,2,3,4,4]' },
      { input: 'l1 = [], l2 = []', expectedOutput: '[]' }
    ]
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    description: 'Find the maximum profit from a list of stock prices.',
    difficulty: 'easy',
    sampleInput: 'prices = [7,1,5,3,6,4]',
    sampleOutput: '5',
    topics: ['Array', 'Dynamic Programming'],
    companies: ['Amazon', 'Google', 'Facebook'],
    link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    testCases: [
      { input: 'prices = [7,1,5,3,6,4]', expectedOutput: '5' },
      { input: 'prices = [7,6,4,3,1]', expectedOutput: '0' }
    ]
  },
  {
    title: 'Valid Anagram',
    description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.',
    difficulty: 'easy',
    sampleInput: 's = "anagram", t = "nagaram"',
    sampleOutput: 'true',
    topics: ['Hash Table', 'String', 'Sorting'],
    companies: ['Google', 'Microsoft'],
    link: 'https://leetcode.com/problems/valid-anagram/',
    testCases: [
      { input: 's = "anagram", t = "nagaram"', expectedOutput: 'true' },
      { input: 's = "rat", t = "car"', expectedOutput: 'false' }
    ]
  },
  {
    title: 'Group Anagrams',
    description: 'Group the anagrams from a list of strings.',
    difficulty: 'medium',
    sampleInput: 'strs = ["eat","tea","tan","ate","nat","bat"]',
    sampleOutput: '[ ["eat","tea","ate"], ["tan","nat"], ["bat"] ]',
    topics: ['Hash Table', 'String', 'Sorting'],
    companies: ['Amazon', 'Facebook'],
    link: 'https://leetcode.com/problems/group-anagrams/',
    testCases: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[ ["eat","tea","ate"], ["tan","nat"], ["bat"] ]' },
      { input: 'strs = [""]', expectedOutput: '[ [""] ]' }
    ]
  },
  {
    title: 'Maximum Subarray',
    description: 'Find the contiguous subarray with the largest sum.',
    difficulty: 'easy',
    sampleInput: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
    sampleOutput: '6',
    topics: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
    companies: ['Amazon', 'Microsoft'],
    link: 'https://leetcode.com/problems/maximum-subarray/',
    testCases: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' },
      { input: 'nums = [1]', expectedOutput: '1' }
    ]
  },
  {
    title: 'Climbing Stairs',
    description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?',
    difficulty: 'easy',
    sampleInput: 'n = 2',
    sampleOutput: '2',
    topics: ['Dynamic Programming'],
    companies: ['Amazon', 'Google'],
    link: 'https://leetcode.com/problems/climbing-stairs/',
    testCases: [
      { input: 'n = 2', expectedOutput: '2' },
      { input: 'n = 3', expectedOutput: '3' }
    ]
  },
  {
    title: 'Set Matrix Zeroes',
    description: 'Given an m x n integer matrix, if an element is 0, set its entire row and column to 0.',
    difficulty: 'medium',
    sampleInput: 'matrix = [[1,1,1],[1,0,1],[1,1,1]]',
    sampleOutput: '[[1,0,1],[0,0,0],[1,0,1]]',
    topics: ['Array'],
    companies: ['Facebook', 'Amazon'],
    link: 'https://leetcode.com/problems/set-matrix-zeroes/',
    testCases: [
      { input: 'matrix = [[1,1,1],[1,0,1],[1,1,1]]', expectedOutput: '[[1,0,1],[0,0,0],[1,0,1]]' },
      { input: 'matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]', expectedOutput: '[[0,0,0,0],[0,4,5,0],[0,3,1,0]]' }
    ]
  },
  {
    title: 'Search in Rotated Sorted Array',
    description: 'Search for a target value in a rotated sorted array.',
    difficulty: 'medium',
    sampleInput: 'nums = [4,5,6,7,0,1,2], target = 0',
    sampleOutput: '4',
    topics: ['Array', 'Binary Search'],
    companies: ['Google', 'Amazon'],
    link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    testCases: [
      { input: 'nums = [4,5,6,7,0,1,2], target = 0', expectedOutput: '4' },
      { input: 'nums = [1], target = 0', expectedOutput: '-1' }
    ]
  },
  {
    title: 'Combination Sum',
    description: 'Find all unique combinations in candidates where the candidate numbers sum to target.',
    difficulty: 'medium',
    sampleInput: 'candidates = [2,3,6,7], target = 7',
    sampleOutput: '[[7],[2,2,3]]',
    topics: ['Array', 'Backtracking'],
    companies: ['Amazon', 'Microsoft'],
    link: 'https://leetcode.com/problems/combination-sum/',
    testCases: [
      { input: 'candidates = [2,3,6,7], target = 7', expectedOutput: '[[7],[2,2,3]]' },
      { input: 'candidates = [2,3,5], target = 8', expectedOutput: '[[2,2,2,2],[2,3,3],[3,5]]' }
    ]
  },
  {
    title: 'Minimum Path Sum',
    description: 'Find a path from top left to bottom right which minimizes the sum of all numbers along its path.',
    difficulty: 'medium',
    sampleInput: 'grid = [[1,3,1],[1,5,1],[4,2,1]]',
    sampleOutput: '7',
    topics: ['Array', 'Dynamic Programming'],
    companies: ['Amazon', 'Google'],
    link: 'https://leetcode.com/problems/minimum-path-sum/',
    testCases: [
      { input: 'grid = [[1,3,1],[1,5,1],[4,2,1]]', expectedOutput: '7' },
      { input: 'grid = [[1,2,3],[4,5,6]]', expectedOutput: '12' }
    ]
  },
  {
    title: 'Word Search',
    description: 'Given a 2D board and a word, find if the word exists in the grid.',
    difficulty: 'medium',
    sampleInput: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"',
    sampleOutput: 'true',
    topics: ['Array', 'Backtracking'],
    companies: ['Facebook', 'Google'],
    link: 'https://leetcode.com/problems/word-search/',
    testCases: [
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', expectedOutput: 'true' },
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"', expectedOutput: 'true' }
    ]
  },
  {
    title: 'Trapping Rain Water',
    description: 'Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.',
    difficulty: 'hard',
    sampleInput: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
    sampleOutput: '6',
    topics: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'],
    companies: ['Amazon', 'Facebook'],
    link: 'https://leetcode.com/problems/trapping-rain-water/',
    testCases: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6' },
      { input: 'height = [4,2,0,3,2,5]', expectedOutput: '9' }
    ]
  },
  {
    title: 'Jump Game',
    description: 'Given an array of non-negative integers, determine if you can reach the last index.',
    difficulty: 'medium',
    sampleInput: 'nums = [2,3,1,1,4]',
    sampleOutput: 'true',
    topics: ['Array', 'Dynamic Programming', 'Greedy'],
    companies: ['Google', 'Microsoft'],
    link: 'https://leetcode.com/problems/jump-game/',
    testCases: [
      { input: 'nums = [2,3,1,1,4]', expectedOutput: 'true' },
      { input: 'nums = [3,2,1,0,4]', expectedOutput: 'false' }
    ]
  },
  {
    title: 'Merge Intervals',
    description: 'Given an array of intervals, merge all overlapping intervals.',
    difficulty: 'medium',
    sampleInput: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
    sampleOutput: '[[1,6],[8,10],[15,18]]',
    topics: ['Array', 'Sorting'],
    companies: ['Facebook', 'Amazon'],
    link: 'https://leetcode.com/problems/merge-intervals/',
    testCases: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]' },
      { input: 'intervals = [[1,4],[4,5]]', expectedOutput: '[[1,5]]' }
    ]
  },
  {
    title: 'Product of Array Except Self',
    description: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].',
    difficulty: 'medium',
    sampleInput: 'nums = [1,2,3,4]',
    sampleOutput: '[24,12,8,6]',
    topics: ['Array', 'Prefix Sum'],
    companies: ['Amazon', 'Microsoft'],
    link: 'https://leetcode.com/problems/product-of-array-except-self/',
    testCases: [
      { input: 'nums = [1,2,3,4]', expectedOutput: '[24,12,8,6]' },
      { input: 'nums = [-1,1,0,-3,3]', expectedOutput: '[0,0,9,0,0]' }
    ]
  },
  {
    title: 'Binary Tree Level Order Traversal',
    description: 'Return the level order traversal of its nodes\' values. (ie, from left to right, level by level).',
    difficulty: 'medium',
    sampleInput: 'root = [3,9,20,null,null,15,7]',
    sampleOutput: '[[3],[9,20],[15,7]]',
    topics: ['Tree', 'Breadth-First Search'],
    companies: ['Facebook', 'Amazon'],
    link: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
    testCases: [
      { input: 'root = [3,9,20,null,null,15,7]', expectedOutput: '[[3],[9,20],[15,7]]' },
      { input: 'root = [1]', expectedOutput: '[[1]]' }
    ]
  },
  {
    title: 'Number of Islands',
    description: 'Given a 2d grid map of \'1\'s (land) and \'0\'s (water), return the number of islands.',
    difficulty: 'medium',
    sampleInput: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
    sampleOutput: '1',
    topics: ['Depth-First Search', 'Breadth-First Search', 'Union Find'],
    companies: ['Amazon', 'Google'],
    link: 'https://leetcode.com/problems/number-of-islands/',
    testCases: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', expectedOutput: '1' },
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', expectedOutput: '3' }
    ]
  },
  {
    title: 'Course Schedule',
    description: 'There are a total of numCourses courses you have to take, labeled from 0 to numCourses-1. Some courses may have prerequisites. Return true if you can finish all courses.',
    difficulty: 'medium',
    sampleInput: 'numCourses = 2, prerequisites = [[1,0]]',
    sampleOutput: 'true',
    topics: ['Graph', 'Topological Sort'],
    companies: ['Facebook', 'Google'],
    link: 'https://leetcode.com/problems/course-schedule/',
    testCases: [
      { input: 'numCourses = 2, prerequisites = [[1,0]]', expectedOutput: 'true' },
      { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', expectedOutput: 'false' }
    ]
  },
  {
    title: 'Implement Trie (Prefix Tree)',
    description: 'Implement a trie with insert, search, and startsWith methods.',
    difficulty: 'medium',
    sampleInput: 'insert("apple"), search("apple"), search("app"), startsWith("app")',
    sampleOutput: 'true, false, true',
    topics: ['Design', 'Trie'],
    companies: ['Google', 'Facebook'],
    link: 'https://leetcode.com/problems/implement-trie-prefix-tree/',
    testCases: [
      { input: 'insert("apple"), search("apple")', expectedOutput: 'true' },
      { input: 'insert("apple"), search("app")', expectedOutput: 'false' }
    ]
  },
  {
    title: 'Word Ladder',
    description: 'Given two words (beginWord and endWord), and a dictionary\'s word list, find the length of shortest transformation sequence from beginWord to endWord.',
    difficulty: 'hard',
    sampleInput: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]',
    sampleOutput: '5',
    topics: ['Breadth-First Search'],
    companies: ['Amazon', 'Facebook'],
    link: 'https://leetcode.com/problems/word-ladder/',
    testCases: [
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', expectedOutput: '5' },
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', expectedOutput: '0' }
    ]
  },
  {
    title: 'Find Minimum in Rotated Sorted Array',
    description: 'Find the minimum element in a rotated sorted array.',
    difficulty: 'medium',
    sampleInput: 'nums = [3,4,5,1,2]',
    sampleOutput: '1',
    topics: ['Array', 'Binary Search'],
    companies: ['Amazon', 'Microsoft'],
    link: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/',
    testCases: [
      { input: 'nums = [3,4,5,1,2]', expectedOutput: '1' },
      { input: 'nums = [11,13,15,17]', expectedOutput: '11' }
    ]
  },
  {
    title: 'Reverse Linked List',
    description: 'Reverse a singly linked list.',
    difficulty: 'easy',
    sampleInput: 'head = [1,2,3,4,5]',
    sampleOutput: '[5,4,3,2,1]',
    topics: ['Linked List'],
    companies: ['Amazon', 'Microsoft'],
    link: 'https://leetcode.com/problems/reverse-linked-list/',
    testCases: [
      { input: 'head = [1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', expectedOutput: '[2,1]' }
    ]
  },
  {
    title: 'LRU Cache',
    description: 'Design and implement a data structure for Least Recently Used (LRU) cache.',
    difficulty: 'medium',
    sampleInput: 'LRUCache(2), put(1,1), put(2,2), get(1), put(3,3), get(2)',
    sampleOutput: '1, -1',
    topics: ['Design'],
    companies: ['Amazon', 'Microsoft'],
    link: 'https://leetcode.com/problems/lru-cache/',
    testCases: [
      { input: 'put(1,1), put(2,2), get(1)', expectedOutput: '1' },
      { input: 'put(1,1), put(2,2), get(2)', expectedOutput: '2' }
    ]
  },
  {
    title: 'Maximum Depth of Binary Tree',
    description: 'Given the root of a binary tree, return its maximum depth.',
    difficulty: 'easy',
    sampleInput: 'root = [3,9,20,null,null,15,7]',
    sampleOutput: '3',
    topics: ['Tree', 'Depth-First Search'],
    companies: ['Amazon', 'Google'],
    link: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
    testCases: [
      { input: 'root = [3,9,20,null,null,15,7]', expectedOutput: '3' },
      { input: 'root = [1,null,2]', expectedOutput: '2' }
    ]
  },
  {
    title: 'Diameter of Binary Tree',
    description: 'Given the root of a binary tree, return the length of the diameter of the tree.',
    difficulty: 'easy',
    sampleInput: 'root = [1,2,3,4,5]',
    sampleOutput: '3',
    topics: ['Tree', 'Depth-First Search'],
    companies: ['Facebook', 'Amazon'],
    link: 'https://leetcode.com/problems/diameter-of-binary-tree/',
    testCases: [
      { input: 'root = [1,2,3,4,5]', expectedOutput: '3' },
      { input: 'root = [1,2]', expectedOutput: '1' }
    ]
  },
  {
    title: 'Subarray Sum Equals K',
    description: 'Given an array of integers and an integer k, find the total number of continuous subarrays whose sum equals to k.',
    difficulty: 'medium',
    sampleInput: 'nums = [1,1,1], k = 2',
    sampleOutput: '2',
    topics: ['Array', 'Hash Table'],
    companies: ['Facebook', 'Amazon'],
    link: 'https://leetcode.com/problems/subarray-sum-equals-k/',
    testCases: [
      { input: 'nums = [1,1,1], k = 2', expectedOutput: '2' },
      { input: 'nums = [1,2,3], k = 3', expectedOutput: '2' }
    ]
  },
  {
    title: 'Find Peak Element',
    description: 'A peak element is an element that is strictly greater than its neighbors. Find a peak element and return its index.',
    difficulty: 'medium',
    sampleInput: 'nums = [1,2,3,1]',
    sampleOutput: '2',
    topics: ['Array', 'Binary Search'],
    companies: ['Google', 'Facebook'],
    link: 'https://leetcode.com/problems/find-peak-element/',
    testCases: [
      { input: 'nums = [1,2,3,1]', expectedOutput: '2' },
      { input: 'nums = [1,2,1,3,5,6,4]', expectedOutput: '5' }
    ]
  },
  {
    title: 'House Robber',
    description: 'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Find the maximum amount you can rob tonight.',
    difficulty: 'medium',
    sampleInput: 'nums = [1,2,3,1]',
    sampleOutput: '4',
    topics: ['Array', 'Dynamic Programming'],
    companies: ['Amazon', 'Microsoft'],
    link: 'https://leetcode.com/problems/house-robber/',
    testCases: [
      { input: 'nums = [1,2,3,1]', expectedOutput: '4' },
      { input: 'nums = [2,7,9,3,1]', expectedOutput: '12' }
    ]
  },
  {
    title: 'Coin Change',
    description: 'You are given coins of different denominations and a total amount of money. Compute the fewest number of coins needed to make up that amount.',
    difficulty: 'medium',
    sampleInput: 'coins = [1,2,5], amount = 11',
    sampleOutput: '3',
    topics: ['Dynamic Programming', 'Breadth-First Search'],
    companies: ['Google', 'Microsoft'],
    link: 'https://leetcode.com/problems/coin-change/',
    testCases: [
      { input: 'coins = [1,2,5], amount = 11', expectedOutput: '3' },
      { input: 'coins = [2], amount = 3', expectedOutput: '-1' }
    ]
  },
  {
    title: 'Longest Consecutive Sequence',
    description: 'Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.',
    difficulty: 'medium',
    sampleInput: 'nums = [100,4,200,1,3,2]',
    sampleOutput: '4',
    topics: ['Array', 'Union Find'],
    companies: ['Facebook', 'Google'],
    link: 'https://leetcode.com/problems/longest-consecutive-sequence/',
    testCases: [
      { input: 'nums = [100,4,200,1,3,2]', expectedOutput: '4' },
      { input: 'nums = [0,3,7,2,5,8,4,6,0,1]', expectedOutput: '9' }
    ]
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    
    // Clear existing questions
    console.log('Deleting existing questions...');
    await Question.deleteMany({});
    
    console.log('Problems array length:', problems.length);
    console.log('First 10 problems:', problems.slice(0, 10));
    
    // Insert all problems with mock user ID
    console.log('Inserting problems...');
    let skipped = 0;
    let inserted = 0;
    const questionPromises = problems.map(problem => {
      const missingFields = [];
      if (!problem) {
        skipped++;
        console.log('Skipping: problem is undefined/null');
        return Promise.resolve();
      }
      if (!problem.title) missingFields.push('title');
      if (!problem.description) missingFields.push('description');
      if (!problem.difficulty) missingFields.push('difficulty');
      // Don't skip for sampleInput/sampleOutput/testCases
      if (missingFields.length) {
        skipped++;
        console.log('Skipping problem due to missing fields:', missingFields, problem);
        return Promise.resolve();
      }
      inserted++;
      return Question.create({
        ...problem,
        createdBy: MOCK_USER_ID,
        sampleInput: problem.sampleInput || '',
        sampleOutput: problem.sampleOutput || '',
        testCases: problem.testCases || [],
        totalSubmissions: 0,
        successfulSubmissions: 0
      });
    });
    await Promise.all(questionPromises);
    const count = await Question.countDocuments();
    console.log(`Successfully seeded ${inserted} problems! Skipped ${skipped}. DB now has ${count} problems.`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
  }
}

seed();

import type { Problem, TestCase, Submission, LineComment } from '@/types/problem';

export const mockTestCases: Record<string, TestCase[]> = {
  'two-sum': [
    {
      id: 'tc-1',
      problemId: 'two-sum',
      input: 'nums = [2,7,11,15], target = 9',
      expectedOutput: '[0,1]',
      isVisible: true,
      points: 20,
      order: 1,
    },
    {
      id: 'tc-2',
      problemId: 'two-sum',
      input: 'nums = [3,2,4], target = 6',
      expectedOutput: '[1,2]',
      isVisible: true,
      points: 20,
      order: 2,
    },
    {
      id: 'tc-3',
      problemId: 'two-sum',
      input: 'nums = [3,3], target = 6',
      expectedOutput: '[0,1]',
      isVisible: true,
      points: 20,
      order: 3,
    },
    {
      id: 'tc-4',
      problemId: 'two-sum',
      input: 'nums = [-1,-2,-3,-4,-5], target = -8',
      expectedOutput: '[2,4]',
      isVisible: false,
      points: 20,
      order: 4,
    },
    {
      id: 'tc-5',
      problemId: 'two-sum',
      input: 'nums = [1000000000, 500, 1000000000], target = 2000000000',
      expectedOutput: '[0,2]',
      isVisible: false,
      points: 20,
      order: 5,
    },
  ],
  'valid-parentheses': [
    {
      id: 'tc-vp-1',
      problemId: 'valid-parentheses',
      input: 's = "()"',
      expectedOutput: 'true',
      isVisible: true,
      points: 25,
      order: 1,
    },
    {
      id: 'tc-vp-2',
      problemId: 'valid-parentheses',
      input: 's = "()[]{}"',
      expectedOutput: 'true',
      isVisible: true,
      points: 25,
      order: 2,
    },
    {
      id: 'tc-vp-3',
      problemId: 'valid-parentheses',
      input: 's = "(]"',
      expectedOutput: 'false',
      isVisible: true,
      points: 25,
      order: 3,
    },
    {
      id: 'tc-vp-4',
      problemId: 'valid-parentheses',
      input: 's = "([)]"',
      expectedOutput: 'false',
      isVisible: false,
      points: 25,
      order: 4,
    },
  ],
  'longest-substring': [
    {
      id: 'tc-ls-1',
      problemId: 'longest-substring',
      input: 's = "abcabcbb"',
      expectedOutput: '3',
      isVisible: true,
      points: 30,
      order: 1,
    },
    {
      id: 'tc-ls-2',
      problemId: 'longest-substring',
      input: 's = "bbbbb"',
      expectedOutput: '1',
      isVisible: true,
      points: 35,
      order: 2,
    },
    {
      id: 'tc-ls-3',
      problemId: 'longest-substring',
      input: 's = "pwwkew"',
      expectedOutput: '3',
      isVisible: false,
      points: 35,
      order: 3,
    },
  ],
  'merge-intervals': [
    {
      id: 'tc-mi-1',
      problemId: 'merge-intervals',
      input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
      expectedOutput: '[[1,6],[8,10],[15,18]]',
      isVisible: true,
      points: 50,
      order: 1,
    },
    {
      id: 'tc-mi-2',
      problemId: 'merge-intervals',
      input: 'intervals = [[1,4],[4,5]]',
      expectedOutput: '[[1,5]]',
      isVisible: true,
      points: 50,
      order: 2,
    },
  ],
};

export const mockProblems: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'easy',
    tags: ['Array', 'Hash Table'],
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    totalPoints: 100,
    assignedCourseId: 1,
    assignedGroupName: 'Group Alpha (CS-2025)',
    deadline: '2026-12-15T23:59:59Z',
    userStatus: 'solved',
    userBestScore: 10,
    totalSubmissions: 1420,
    acceptanceRate: 84.5,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly one solution***, and you may not use the *same* element twice.

You can return the answer in any order.`,
    inputFormat: `The first line contains integer \`target\`. The second line contains space-separated integers representing the array \`nums\`.`,
    outputFormat: `Return a 2-element array containing the indices \`[i, j]\`.`,
    constraints: `- $2 \\le \\text{nums.length} \\le 10^4$
- $-10^9 \\le \\text{nums}[i] \\le 10^9$
- $-10^9 \\le \\text{target} \\le 10^9$
- **Only one valid answer exists.**`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]',
      },
    ],
    allowedLanguages: ['python', 'javascript', 'java', 'cpp'],
    starterCode: {
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your solution here
        seen = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in seen:
                return [seen[diff], i]
            seen[num] = i
        return []
`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) {
            return [map.get(diff), i];
        }
        map.set(nums[i], i);
    }
    return [];
}
`,
      java: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        throw new IllegalArgumentException("No two sum solution");
    }
}
`,
      cpp: `#include <vector>
#include <unordered_map>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        std::unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); ++i) {
            int diff = target - nums[i];
            if (seen.find(diff) != seen.end()) {
                return {seen[diff], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};
`,
    },
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'easy',
    tags: ['Stack', 'String'],
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    totalPoints: 100,
    assignedCourseId: 1,
    assignedGroupName: 'Group Alpha (CS-2025)',
    deadline: '2026-12-20T23:59:59Z',
    userStatus: 'attempted',
    userBestScore: 7,
    totalSubmissions: 980,
    acceptanceRate: 78.2,
    createdAt: '2024-01-12T08:00:00Z',
    updatedAt: '2024-01-12T08:00:00Z',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    inputFormat: `A single string \`s\`.`,
    outputFormat: `Boolean \`true\` or \`false\`.`,
    constraints: `- $1 \\le \\text{s.length} \\le 10^4$
- \`s\` consists of parentheses only \`'()[]{}'\`.`,
    examples: [
      {
        input: 's = "()"',
        output: 'true',
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
      },
      {
        input: 's = "(]"',
        output: 'false',
      },
    ],
    allowedLanguages: ['python', 'javascript', 'java', 'cpp'],
    starterCode: {
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Write your code here
        stack = []
        mapping = {")": "(", "}": "{", "]": "["}
        for char in s:
            if char in mapping:
                top = stack.pop() if stack else '#'
                if mapping[char] != top:
                    return False
            else:
                stack.append(char)
        return not stack
`,
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    const stack = [];
    const pairs = { ')': '(', '}': '{', ']': '[' };
    for (const ch of s) {
        if (pairs[ch]) {
            if (stack.pop() !== pairs[ch]) return false;
        } else {
            stack.push(ch);
        }
    }
    return stack.length === 0;
}
`,
      java: `import java.util.Stack;

class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}
`,
      cpp: `#include <string>
#include <stack>

class Solution {
public:
    bool isValid(std::string s) {
        std::stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '{' || c == '[') st.push(c);
            else {
                if (st.empty()) return false;
                char top = st.top();
                st.pop();
                if ((c == ')' && top != '(') ||
                    (c == '}' && top != '{') ||
                    (c == ']' && top != '[')) return false;
            }
        }
        return st.empty();
    }
};
`,
    },
  },
  {
    id: 'longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring',
    difficulty: 'medium',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    totalPoints: 100,
    assignedCourseId: 2,
    assignedGroupName: 'Group Alpha (CS-2025)',
    deadline: '2026-12-25T23:59:59Z',
    userStatus: 'unsolved',
    totalSubmissions: 630,
    acceptanceRate: 52.1,
    createdAt: '2024-01-14T08:00:00Z',
    updatedAt: '2024-01-14T08:00:00Z',
    description: `Given a string \`s\`, find the length of the **longest substring** without duplicate characters.

A **substring** is a contiguous non-empty sequence of characters within a string.`,
    inputFormat: `A single string \`s\`.`,
    outputFormat: `An integer representing the length of the longest substring.`,
    constraints: `- $0 \\le \\text{s.length} \\le 5 \\times 10^4$
- \`s\` consists of English letters, digits, symbols and spaces.`,
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.',
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3. Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.',
      },
    ],
    allowedLanguages: ['python', 'javascript', 'java', 'cpp'],
    starterCode: {
      python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        char_map = {}
        left = max_len = 0
        for right, char in enumerate(s):
            if char in char_map and char_map[char] >= left:
                left = char_map[char] + 1
            char_map[char] = right
            max_len = max(max_len, right - left + 1)
        return max_len
`,
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
    const map = new Map();
    let left = 0;
    let maxLen = 0;
    for (let right = 0; right < s.length; right++) {
        if (map.has(s[right]) && map.get(s[right]) >= left) {
            left = map.get(s[right]) + 1;
        }
        map.set(s[right], right);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}
`,
      java: `import java.util.HashMap;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        HashMap<Character, Integer> map = new HashMap<>();
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c) && map.get(c) >= left) {
                left = map.get(c) + 1;
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}
`,
      cpp: `#include <string>
#include <unordered_map>
#include <algorithm>

class Solution {
public:
    int lengthOfLongestSubstring(std::string s) {
        std::unordered_map<char, int> map;
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.length(); ++right) {
            if (map.find(s[right]) != map.end() && map[s[right]] >= left) {
                left = map[s[right]] + 1;
            }
            map[s[right]] = right;
            maxLen = std::max(maxLen, right - left + 1);
        }
        return maxLen;
    }
};
`,
    },
  },
  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    slug: 'merge-intervals',
    difficulty: 'medium',
    tags: ['Array', 'Sorting'],
    timeLimitMs: 2000,
    memoryLimitMb: 512,
    totalPoints: 100,
    assignedCourseId: 2,
    assignedGroupName: 'Group Alpha (CS-2025)',
    deadline: '2026-12-30T23:59:59Z',
    userStatus: 'unsolved',
    totalSubmissions: 410,
    acceptanceRate: 46.8,
    createdAt: '2024-01-16T08:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z',
    description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return *an array of the non-overlapping intervals that cover all the intervals in the input*.`,
    inputFormat: `2D array of integers \`intervals\`.`,
    outputFormat: `2D array of non-overlapping intervals.`,
    constraints: `- $1 \\le \\text{intervals.length} \\le 10^4$
- $\\text{intervals}[i].\\text{length} == 2$
- $0 \\le \\text{start}_i \\le \\text{end}_i \\le 10^4$`,
    examples: [
      {
        input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
        output: '[[1,6],[8,10],[15,18]]',
        explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].',
      },
      {
        input: 'intervals = [[1,4],[4,5]]',
        output: '[[1,5]]',
        explanation: 'Intervals [1,4] and [4,5] are considered overlapping.',
      },
    ],
    allowedLanguages: ['python', 'javascript', 'java', 'cpp'],
    starterCode: {
      python: `class Solution:
    def merge(self, intervals: list[list[int]]) -> list[list[int]]:
        intervals.sort(key=lambda x: x[0])
        merged = []
        for interval in intervals:
            if not merged or merged[-1][1] < interval[0]:
                merged.append(interval)
            else:
                merged[-1][1] = max(merged[-1][1], interval[1])
        return merged
`,
      javascript: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function merge(intervals) {
    if (!intervals.length) return [];
    intervals.sort((a, b) => a[0] - b[0]);
    const res = [intervals[0]];
    for (let i = 1; i < intervals.length; i++) {
        const curr = intervals[i];
        const last = res[res.length - 1];
        if (curr[0] <= last[1]) {
            last[1] = Math.max(last[1], curr[1]);
        } else {
            res.push(curr);
        }
    }
    return res;
}
`,
      java: `import java.util.*;

class Solution {
    public int[][] merge(int[][] intervals) {
        if (intervals.length <= 1) return intervals;
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> result = new ArrayList<>();
        int[] current = intervals[0];
        result.add(current);
        for (int[] interval : intervals) {
            if (interval[0] <= current[1]) {
                current[1] = Math.max(current[1], interval[1]);
            } else {
                current = interval;
                result.add(current);
            }
        }
        return result.toArray(new int[result.size()][]);
    }
}
`,
      cpp: `#include <vector>
#include <algorithm>

class Solution {
public:
    std::vector<std::vector<int>> merge(std::vector<std::vector<int>>& intervals) {
        if (intervals.empty()) return {};
        std::sort(intervals.begin(), intervals.end());
        std::vector<std::vector<int>> res = {intervals[0]};
        for (size_t i = 1; i < intervals.size(); ++i) {
            if (intervals[i][0] <= res.back()[1]) {
                res.back()[1] = std::max(res.back()[1], intervals[i][1]);
            } else {
                res.push_back(intervals[i]);
            }
        }
        return res;
    }
};
`,
    },
  },
];

export const mockComments: Record<string, LineComment[]> = {
  'sub-101': [
    {
      id: 'c-1',
      submissionId: 'sub-101',
      lineNumber: 4,
      author: {
        id: 1,
        name: 'Alice Administrator',
        role: 'admin',
      },
      content: 'Excellent use of a hash map here. This ensures an optimal O(n) time complexity compared to the brute force O(n^2).',
      severity: 'suggestion',
      status: 'resolved',
      createdAt: '2024-03-01T14:32:00Z',
    },
    {
      id: 'c-2',
      submissionId: 'sub-101',
      lineNumber: 8,
      author: {
        id: 1,
        name: 'Alice Administrator',
        role: 'admin',
      },
      content: 'Consider adding a quick sanity check for edge cases where nums is empty or contains fewer than 2 elements.',
      severity: 'suggestion',
      status: 'open',
      createdAt: '2024-03-01T14:35:00Z',
    },
  ],
};

export const mockSubmissions: Submission[] = [
  {
    id: 'sub-101',
    problemId: 'two-sum',
    problemTitle: 'Two Sum',
    studentId: 2,
    studentName: 'Alex Rivers',
    studentEmail: 'student@eduflow.dev',
    language: 'python',
    verdict: 'ACCEPTED',
    passedTests: 5,
    totalTests: 5,
    executionTimeMs: 42,
    memoryKb: 14200,
    score: 10,
    submittedAt: '2024-03-01T14:30:00Z',
    isLate: false,
    feedback: 'Clean and optimal solution. Well documented.',
    code: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in seen:
                return [seen[diff], i]
            seen[num] = i
        return []
`,
  },
  {
    id: 'sub-102',
    problemId: 'two-sum',
    problemTitle: 'Two Sum',
    studentId: 3,
    studentName: 'Bob Vance',
    studentEmail: 'bob@eduflow.dev',
    language: 'javascript',
    verdict: 'WRONG_ANSWER',
    passedTests: 2,
    totalTests: 5,
    executionTimeMs: 58,
    memoryKb: 18400,
    score: 4,
    submittedAt: '2024-03-02T10:15:00Z',
    isLate: false,
    feedback: 'Fails on negative integers and duplicate numbers.',
    code: `function twoSum(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) return [i, j];
        }
    }
    return [0, 0];
}
`,
  },
  {
    id: 'sub-103',
    problemId: 'valid-parentheses',
    problemTitle: 'Valid Parentheses',
    studentId: 2,
    studentName: 'Alex Rivers',
    studentEmail: 'student@eduflow.dev',
    language: 'python',
    verdict: 'TIME_LIMIT_EXCEEDED',
    passedTests: 3,
    totalTests: 4,
    executionTimeMs: 1200,
    memoryKb: 15300,
    score: 7,
    submittedAt: '2024-03-03T16:20:00Z',
    isLate: false,
    feedback: 'Infinite recursion in edge cases when parentheses are nested deeply.',
    code: `class Solution:
    def isValid(self, s: str) -> bool:
        while "()" in s or "[]" in s or "{}" in s:
            s = s.replace("()", "").replace("[]", "").replace("{}", "")
        return s == ""
`,
  },
  {
    id: 'sub-104',
    problemId: 'longest-substring',
    problemTitle: 'Longest Substring Without Repeating Characters',
    studentId: 4,
    studentName: 'Chloe Price',
    studentEmail: 'chloe@eduflow.dev',
    language: 'cpp',
    verdict: 'COMPILE_ERROR',
    passedTests: 0,
    totalTests: 3,
    executionTimeMs: 0,
    memoryKb: 0,
    score: 0,
    submittedAt: '2024-03-04T09:40:00Z',
    isLate: true,
    feedback: 'Syntax error: missing semicolon and mismatched type signature.',
    code: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> m
        return 0;
    }
};
`,
  },
];

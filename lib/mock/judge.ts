import { sleep } from '@/lib/utils';
import type {
  Verdict,
  JudgeResult,
  TestResult,
  TestCase,
  Language,
} from '@/types/problem';
import { mockTestCases } from './problems';

/**
 * Determines mock verdict based on code inspection and keywords.
 * Enables deterministic testing of every possible judge state.
 */
function determineVerdict(code: string): {
  verdict: Verdict;
  errorMessage?: string;
  compileOutput?: string;
} {
  const lower = code.toLowerCase();

  // Explicit keyword triggers
  if (lower.includes('// verdict: ce') || lower.includes('# verdict: ce') || lower.includes('/* verdict: ce */') || lower.includes('syntaxerror') || lower.includes('compile error')) {
    return {
      verdict: 'COMPILE_ERROR',
      compileOutput: `main.cpp: In function 'int main()':
main.cpp:8:17: error: expected ';' before '}' token
    return result
                 ^
                 ;
1 error generated.`,
    };
  }

  if (lower.includes('// verdict: tle') || lower.includes('# verdict: tle') || lower.includes('time limit') || lower.includes('infinite loop') || lower.includes('sleep(')) {
    return {
      verdict: 'TIME_LIMIT_EXCEEDED',
      errorMessage: 'Time Limit Exceeded: Process exceeded 1000ms execution limit.',
    };
  }

  if (lower.includes('// verdict: mle') || lower.includes('# verdict: mle') || lower.includes('memory limit') || lower.includes('outofmemory')) {
    return {
      verdict: 'MEMORY_LIMIT_EXCEEDED',
      errorMessage: 'Memory Limit Exceeded: Process exceeded 256MB allocation limit.',
    };
  }

  if (lower.includes('// verdict: re') || lower.includes('# verdict: re') || lower.includes('runtime error') || lower.includes('/ 0') || lower.includes('throw new error')) {
    return {
      verdict: 'RUNTIME_ERROR',
      errorMessage: 'ZeroDivisionError: integer division or modulo by zero\n  at line 6 in solution',
    };
  }

  if (lower.includes('// verdict: wa') || lower.includes('# verdict: wa') || lower.includes('wrong answer') || lower.includes('return [0, 0]') || lower.includes('return false') || lower.includes('return -1')) {
    return {
      verdict: 'WRONG_ANSWER',
    };
  }

  if (lower.includes('// verdict: ac') || lower.includes('# verdict: ac') || lower.includes('accepted')) {
    return { verdict: 'ACCEPTED' };
  }

  // Realistic default heuristics:
  // If code is trivial (< 40 chars) or empty
  if (code.trim().length < 40) {
    return { verdict: 'WRONG_ANSWER' };
  }

  // Mostly ACCEPTED for normal code snippets
  const rand = Math.random();
  if (rand < 0.75) {
    return { verdict: 'ACCEPTED' };
  } else if (rand < 0.88) {
    return { verdict: 'WRONG_ANSWER' };
  } else if (rand < 0.94) {
    return { verdict: 'TIME_LIMIT_EXCEEDED', errorMessage: 'Time Limit Exceeded' };
  } else {
    return { verdict: 'RUNTIME_ERROR', errorMessage: 'IndexError: list index out of range' };
  }
}

export interface JudgeExecutionOptions {
  onStatusChange?: (status: 'IN_QUEUE' | 'RUNNING' | 'FINISHED') => void;
}

/**
 * Simulates the backend judge execution pipeline:
 * 1. Queued state
 * 2. Compiling / Running state
 * 3. Test evaluation
 * 4. Final Verdict and test details
 */
export async function simulateJudge(
  problemId: string,
  language: Language,
  code: string,
  isFullSubmit: boolean = true,
  customInput?: string,
  options?: JudgeExecutionOptions
): Promise<JudgeResult> {
  const { onStatusChange } = options || {};

  // 1. Initial Queued state
  if (onStatusChange) {
    onStatusChange('IN_QUEUE');
  }
  await sleep(400);

  // 2. Running state
  if (onStatusChange) {
    onStatusChange('RUNNING');
  }
  // Realistic judge delay between 800ms and 1800ms
  const executionDelay = Math.floor(Math.random() * 800) + 700;
  await sleep(executionDelay);

  const { verdict, errorMessage, compileOutput } = determineVerdict(code);
  const testCases: TestCase[] = mockTestCases[problemId] || [
    {
      id: 'default-tc-1',
      problemId,
      input: 'sample_input_1',
      expectedOutput: 'sample_output_1',
      isVisible: true,
      points: 50,
      order: 1,
    },
    {
      id: 'default-tc-2',
      problemId,
      input: 'sample_input_2',
      expectedOutput: 'sample_output_2',
      isVisible: false,
      points: 50,
      order: 2,
    },
  ];

  // If it is a custom input run (not full submit)
  if (!isFullSubmit && customInput) {
    if (onStatusChange) onStatusChange('FINISHED');
    return {
      submissionId: `run-${Date.now()}`,
      verdict: verdict === 'COMPILE_ERROR' ? 'COMPILE_ERROR' : 'ACCEPTED',
      passedTests: 1,
      totalTests: 1,
      executionTimeMs: Math.floor(Math.random() * 45) + 12,
      memoryKb: Math.floor(Math.random() * 5000) + 12000,
      score: 10,
      compileOutput,
      stdout: verdict === 'ACCEPTED' ? `[Custom Input Output]\nProcessed input:\n${customInput}\nResult: OK` : undefined,
      stderr: errorMessage,
      testResults: [
        {
          testCaseId: 'custom-input',
          passed: verdict === 'ACCEPTED',
          input: customInput,
          actualOutput: 'Custom execution finished without exceptions.',
          executionTimeMs: 25,
          memoryKb: 13400,
          isVisible: true,
          errorMessage,
        },
      ],
    };
  }

  // Full submission or sample test runner
  const testResults: TestResult[] = testCases.map((tc, idx) => {
    let passed = false;
    let actualOutput = tc.expectedOutput;

    if (verdict === 'ACCEPTED') {
      passed = true;
    } else if (verdict === 'WRONG_ANSWER') {
      // First test case might pass, others fail
      passed = idx === 0;
      actualOutput = idx === 0 ? tc.expectedOutput : `[Wrong Value: expected ${tc.expectedOutput}, got null]`;
    } else if (verdict === 'TIME_LIMIT_EXCEEDED') {
      passed = idx < 2;
      actualOutput = idx < 2 ? tc.expectedOutput : 'Execution Timed Out (> 1000ms)';
    } else if (verdict === 'COMPILE_ERROR') {
      passed = false;
      actualOutput = '';
    } else {
      passed = false;
      actualOutput = errorMessage || 'Runtime Exception';
    }

    return {
      testCaseId: tc.id,
      passed,
      input: tc.isVisible ? tc.input : undefined,
      expectedOutput: tc.isVisible ? tc.expectedOutput : undefined,
      actualOutput: tc.isVisible ? actualOutput : undefined,
      executionTimeMs: passed ? Math.floor(Math.random() * 30) + 15 : 0,
      memoryKb: Math.floor(Math.random() * 3000) + 14000,
      errorMessage: passed ? undefined : (tc.isVisible ? errorMessage : 'Hidden test case failed'),
      isVisible: tc.isVisible,
    };
  });

  const passedTests = testResults.filter((r) => r.passed).length;
  const totalTests = testResults.length;
  const score = totalTests > 0 ? Math.round((passedTests / totalTests) * 10 * 10) / 10 : 0;

  if (onStatusChange) {
    onStatusChange('FINISHED');
  }

  return {
    submissionId: `sub-${Date.now()}`,
    verdict,
    passedTests,
    totalTests,
    executionTimeMs: Math.floor(Math.random() * 65) + 20,
    memoryKb: Math.floor(Math.random() * 4000) + 14200,
    score,
    compileOutput,
    stdout: verdict === 'ACCEPTED' ? 'All test cases passed successfully.' : undefined,
    stderr: errorMessage,
    testResults,
  };
}

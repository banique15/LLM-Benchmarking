export interface TestCase {
  prompt: string;
  expectedOutput: string;
  evaluationCriteria: any;
}

export interface TestResult {
  id: string;
  prompt: string;
  response: string;
  expectedOutput: string;
  score: number;
  error?: string;
  metrics: {
    latencyMs?: number;
    tokensInput?: number;
    tokensOutput?: number;
    [key: string]: any;
  };
  testCase: TestCase;
}

export interface ModelData {
  id: string;
  name: string;
  provider: string;
}

export interface BenchmarkData {
  id: string;
  name: string;
  description: string;
}

// For BenchmarkResults component
export interface BenchmarkRunResults {
  id: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime?: string;
  error?: string;
  model: ModelData;
  benchmark: BenchmarkData;
  results: TestResult[];
}

// For BenchmarkStatus component
export interface BenchmarkRunStatus {
  id: string;
  status: 'running' | 'completed' | 'failed';
  progress: number | null;
  startTime: string;
  endTime: string | null;
  error: string | null;
  duration?: number;
  model: ModelData;
  benchmark: BenchmarkData;
} 
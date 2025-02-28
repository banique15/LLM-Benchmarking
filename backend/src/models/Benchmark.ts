export interface BenchmarkCategory {
  id?: string;
  name: string;
  description?: string;
  created_at?: Date;
}

export interface Benchmark {
  id?: string;
  name: string;
  category_id?: string;
  description?: string;
  parameters?: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
}

export interface TestCase {
  id?: string;
  benchmark_id: string;
  prompt: string;
  expected_output?: string;
  evaluation_criteria?: Record<string, any>;
  weight?: number;
  tags?: string[];
  created_at?: Date;
  updated_at?: Date;
}

export interface BenchmarkRun {
  id?: string;
  name?: string;
  description?: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  started_at?: Date;
  completed_at?: Date;
  created_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface BenchmarkResult {
  id?: string;
  benchmark_run_id: string;
  model_id: string;
  benchmark_id: string;
  test_case_id: string;
  prompt: string;
  response?: string | null;
  expected_output?: string;
  evaluation_criteria?: Record<string, any>;
  score: number;
  error?: string | null;
  created_at?: string;
  updated_at?: string;
} 
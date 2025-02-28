export interface Model {
  id?: string;
  name: string;
  provider: string;
  version: string;
  api_endpoint?: string;
  description?: string;
  parameters?: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
}

export interface ModelScore {
  id?: string;
  benchmark_run_id: string;
  model_id: string;
  benchmark_id: string;
  score: number;
  rank?: number;
  metrics?: Record<string, any>;
  created_at?: Date;
} 
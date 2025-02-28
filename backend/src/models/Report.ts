export interface Report {
  id?: string;
  benchmark_run_id: string;
  name: string;
  description?: string;
  content?: Record<string, any>;
  public?: boolean;
  created_by?: string;
  created_at?: Date;
  updated_at?: Date;
} 
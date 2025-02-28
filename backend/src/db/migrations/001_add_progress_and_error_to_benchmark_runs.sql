-- Add progress and error fields to benchmark_runs table
ALTER TABLE benchmark_runs
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS error TEXT; 
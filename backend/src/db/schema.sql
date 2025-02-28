-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Models table to store information about different LLMs
CREATE TABLE IF NOT EXISTS models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  version VARCHAR(100) NOT NULL,
  api_endpoint VARCHAR(255),
  description TEXT,
  parameters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, name, version)
);

-- Benchmark categories
CREATE TABLE IF NOT EXISTS benchmark_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name)
);

-- Benchmarks table to store different benchmark tests
CREATE TABLE IF NOT EXISTS benchmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES benchmark_categories(id),
  description TEXT,
  parameters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name)
);

-- Test cases for benchmarks
CREATE TABLE IF NOT EXISTS test_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  benchmark_id UUID REFERENCES benchmarks(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  expected_output TEXT,
  evaluation_criteria JSONB,
  weight FLOAT DEFAULT 1.0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Benchmark runs to track execution of benchmarks
CREATE TABLE IF NOT EXISTS benchmark_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Models included in a benchmark run
CREATE TABLE IF NOT EXISTS benchmark_run_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  benchmark_run_id UUID REFERENCES benchmark_runs(id) ON DELETE CASCADE,
  model_id UUID REFERENCES models(id) ON DELETE CASCADE,
  parameters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(benchmark_run_id, model_id)
);

-- Benchmarks included in a benchmark run
CREATE TABLE IF NOT EXISTS benchmark_run_benchmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  benchmark_run_id UUID REFERENCES benchmark_runs(id) ON DELETE CASCADE,
  benchmark_id UUID REFERENCES benchmarks(id) ON DELETE CASCADE,
  parameters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(benchmark_run_id, benchmark_id)
);

-- Results of benchmark tests
CREATE TABLE IF NOT EXISTS benchmark_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  benchmark_run_id UUID REFERENCES benchmark_runs(id) ON DELETE CASCADE,
  model_id UUID REFERENCES models(id),
  benchmark_id UUID REFERENCES benchmarks(id),
  test_case_id UUID REFERENCES test_cases(id),
  output TEXT,
  score FLOAT,
  metrics JSONB,
  latency_ms INTEGER,
  tokens_input INTEGER,
  tokens_output INTEGER,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aggregate scores for models across benchmarks
CREATE TABLE IF NOT EXISTS model_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  benchmark_run_id UUID REFERENCES benchmark_runs(id) ON DELETE CASCADE,
  model_id UUID REFERENCES models(id),
  benchmark_id UUID REFERENCES benchmarks(id),
  score FLOAT,
  rank INTEGER,
  metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(benchmark_run_id, model_id, benchmark_id)
);

-- Reports generated from benchmark runs
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  benchmark_run_id UUID REFERENCES benchmark_runs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  content JSONB,
  public BOOLEAN DEFAULT FALSE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default benchmark categories
INSERT INTO benchmark_categories (name, description)
VALUES 
  ('Reasoning', 'Tests for logical reasoning and problem-solving capabilities'),
  ('Knowledge', 'Tests for factual knowledge and information retrieval'),
  ('Creativity', 'Tests for creative writing and idea generation'),
  ('Instruction Following', 'Tests for ability to follow complex instructions'),
  ('Coding', 'Tests for code generation and debugging capabilities'),
  ('Math', 'Tests for mathematical reasoning and calculation'),
  ('Ethics', 'Tests for ethical reasoning and bias detection')
ON CONFLICT (name) DO NOTHING; 
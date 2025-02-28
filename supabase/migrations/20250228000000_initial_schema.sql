-- Create schema for LLM benchmarking
CREATE SCHEMA IF NOT EXISTS public;

-- Models table
CREATE TABLE IF NOT EXISTS models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    version VARCHAR(100),
    description TEXT,
    context_length INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(provider, name, version)
);

-- Benchmarks table
CREATE TABLE IF NOT EXISTS benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(name)
);

-- Test cases table
CREATE TABLE IF NOT EXISTS test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    benchmark_id UUID NOT NULL REFERENCES benchmarks(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    expected_output TEXT,
    evaluation_criteria JSONB,
    weight FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Benchmark runs table
CREATE TABLE IF NOT EXISTS benchmark_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Benchmark run benchmarks junction table
CREATE TABLE IF NOT EXISTS benchmark_run_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    benchmark_run_id UUID NOT NULL REFERENCES benchmark_runs(id) ON DELETE CASCADE,
    benchmark_id UUID NOT NULL REFERENCES benchmarks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(benchmark_run_id, benchmark_id)
);

-- Benchmark run models junction table
CREATE TABLE IF NOT EXISTS benchmark_run_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    benchmark_run_id UUID NOT NULL REFERENCES benchmark_runs(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(benchmark_run_id, model_id)
);

-- Test results table
CREATE TABLE IF NOT EXISTS test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    benchmark_run_id UUID NOT NULL REFERENCES benchmark_runs(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    test_case_id UUID NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
    output TEXT,
    latency_ms INTEGER,
    tokens_input INTEGER,
    tokens_output INTEGER,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(benchmark_run_id, model_id, test_case_id)
);

-- Test scores table
CREATE TABLE IF NOT EXISTS test_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_result_id UUID NOT NULL REFERENCES test_results(id) ON DELETE CASCADE,
    score FLOAT,
    evaluation_method VARCHAR(100),
    evaluator_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(test_result_id, evaluation_method)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_test_cases_benchmark_id ON test_cases(benchmark_id);
CREATE INDEX IF NOT EXISTS idx_test_results_benchmark_run_id ON test_results(benchmark_run_id);
CREATE INDEX IF NOT EXISTS idx_test_results_model_id ON test_results(model_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_case_id ON test_results(test_case_id);
CREATE INDEX IF NOT EXISTS idx_test_scores_test_result_id ON test_scores(test_result_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_run_benchmarks_benchmark_run_id ON benchmark_run_benchmarks(benchmark_run_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_run_benchmarks_benchmark_id ON benchmark_run_benchmarks(benchmark_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_run_models_benchmark_run_id ON benchmark_run_models(benchmark_run_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_run_models_model_id ON benchmark_run_models(model_id);

-- Enable Row Level Security
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_run_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_run_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for development)
CREATE POLICY "Allow public read access" ON models FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON models FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON models FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON models FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON benchmarks FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON benchmarks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON benchmarks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON benchmarks FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON test_cases FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON test_cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON test_cases FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON test_cases FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON benchmark_runs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON benchmark_runs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON benchmark_runs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON benchmark_runs FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON benchmark_run_benchmarks FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON benchmark_run_benchmarks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON benchmark_run_benchmarks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON benchmark_run_benchmarks FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON benchmark_run_models FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON benchmark_run_models FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON benchmark_run_models FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON benchmark_run_models FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON test_results FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON test_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON test_results FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON test_results FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON test_scores FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON test_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON test_scores FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON test_scores FOR DELETE USING (true); 
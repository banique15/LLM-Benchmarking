-- Drop existing tables if they exist
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS test_scores CASCADE;
DROP TABLE IF EXISTS benchmark_results CASCADE;

-- Create benchmark_results table
CREATE TABLE benchmark_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    benchmark_run_id UUID NOT NULL,
    benchmark_id UUID NOT NULL,
    test_case_id UUID NOT NULL,
    model_id UUID NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT,
    expected_output TEXT,
    evaluation_criteria JSONB,
    score FLOAT,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_benchmark_run
        FOREIGN KEY(benchmark_run_id) 
        REFERENCES benchmark_runs(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_benchmark
        FOREIGN KEY(benchmark_id) 
        REFERENCES benchmarks(id),
    CONSTRAINT fk_test_case
        FOREIGN KEY(test_case_id) 
        REFERENCES test_cases(id),
    CONSTRAINT fk_model
        FOREIGN KEY(model_id) 
        REFERENCES models(id),
    CONSTRAINT uq_benchmark_result 
        UNIQUE(benchmark_run_id, test_case_id, model_id)
);

-- Add indexes for better query performance
CREATE INDEX idx_benchmark_results_benchmark_run_id ON benchmark_results(benchmark_run_id);
CREATE INDEX idx_benchmark_results_benchmark_id ON benchmark_results(benchmark_id);
CREATE INDEX idx_benchmark_results_model_id ON benchmark_results(model_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_benchmark_results_updated_at
    BEFORE UPDATE ON benchmark_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
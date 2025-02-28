-- Drop all tables in reverse order of creation
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.model_scores CASCADE;
DROP TABLE IF EXISTS public.benchmark_results CASCADE;
DROP TABLE IF EXISTS public.benchmark_run_benchmarks CASCADE;
DROP TABLE IF EXISTS public.benchmark_run_models CASCADE;
DROP TABLE IF EXISTS public.benchmark_runs CASCADE;
DROP TABLE IF EXISTS public.test_cases CASCADE;
DROP TABLE IF EXISTS public.benchmarks CASCADE;
DROP TABLE IF EXISTS public.benchmark_categories CASCADE;
DROP TABLE IF EXISTS public.models CASCADE; 
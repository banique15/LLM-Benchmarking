import { Request, Response } from 'express';
import { BenchmarkEngine } from '../services/benchmark-engine/BenchmarkEngine';
import supabase from '../db/supabase';
import { LLMConnectorFactory } from '../services/llm-connectors/LLMConnectorFactory';

// Update these interfaces at the top of the file, after the imports
interface TestCase {
  prompt: string;
  expected_output: string;
  evaluation_criteria: string;
}

interface BenchmarkResult {
  id: string;
  prompt: string;
  response: string;
  expected_output: string;
  score: number;
  error?: string;
  metrics?: Record<string, any>;
  latency_ms?: number;
  tokens_input?: number;
  tokens_output?: number;
  test_case_id: string;
  test_cases: TestCase;
}

interface Benchmark {
  id: string;
  name: string;
  description: string;
}

interface Model {
  id: string;
  name: string;
  provider: string;
}

interface BenchmarkRunModel {
  models: {
    id: string;
    name: string;
    provider: string;
  };
}

interface BenchmarkRunBenchmark {
  benchmarks: {
    id: string;
    name: string;
    description: string;
  };
}

interface BenchmarkRunData {
  id: string;
  status: string;
  progress: number | null;
  started_at: string;
  completed_at: string | null;
  error: string | null;
  benchmark_run_models: [BenchmarkRunModel];
  benchmark_run_benchmarks: [BenchmarkRunBenchmark];
}

interface BenchmarkRunResponse {
  id: string;
  status: string;
  progress: number;
  started_at: string;
  completed_at: string;
  error?: string;
  benchmark_run_benchmarks: Array<{
    benchmarks: Benchmark;
  }>;
  benchmark_run_models: Array<{
    models: Model;
  }>;
  benchmark_results: Array<BenchmarkResult>;
}

export class BenchmarkController {
  private benchmarkEngine: BenchmarkEngine;

  constructor() {
    this.benchmarkEngine = new BenchmarkEngine();
  }

  /**
   * Get all available models
   */
  async getModels(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .order('provider')
        .order('name');

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json(data);
    } catch (error) {
      console.error('Error fetching models:', error);
      return res.status(500).json({ error: 'Failed to fetch models' });
    }
  }

  /**
   * Get all benchmarks
   */
  async getBenchmarks(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('benchmarks')
        .select(`
          *,
          benchmark_categories (*)
        `)
        .order('name');

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json(data);
    } catch (error) {
      console.error('Error fetching benchmarks:', error);
      return res.status(500).json({ error: 'Failed to fetch benchmarks' });
    }
  }

  /**
   * Get test cases for a benchmark
   */
  async getTestCases(req: Request, res: Response) {
    const { benchmarkId } = req.params;

    try {
      const { data, error } = await supabase
        .from('test_cases')
        .select('*')
        .eq('benchmark_id', benchmarkId)
        .order('created_at');

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json(data);
    } catch (error) {
      console.error(`Error fetching test cases for benchmark ${benchmarkId}:`, error);
      return res.status(500).json({ error: 'Failed to fetch test cases' });
    }
  }

  /**
   * Run a benchmark
   */
  async runBenchmark(req: Request, res: Response): Promise<Response> {
    console.log('Request body:', req.body);
    const { benchmarkId, benchmarkType, modelId, options } = req.body;
    console.log('Extracted values:', { benchmarkId, benchmarkType, modelId, options });

    if (!modelId) {
      return res.status(400).json({ error: 'Model ID is required' });
    }

    if (!benchmarkId && !benchmarkType) {
      return res.status(400).json({ error: 'Either Benchmark ID or Benchmark Type is required' });
    }

    try {
      let finalBenchmarkId = benchmarkId;

      // If benchmarkType is provided but not benchmarkId, look up the benchmark by type
      if (!benchmarkId && benchmarkType) {
        console.log('Looking up benchmark by type:', benchmarkType);
        const { data: benchmarks, error: benchmarkError } = await supabase
          .from('benchmarks')
          .select('id, name')
          .ilike('name', benchmarkType)
          .single();

        console.log('Supabase response:', { data: benchmarks, error: benchmarkError });

        if (benchmarkError || !benchmarks) {
          return res.status(404).json({ error: `Benchmark type '${benchmarkType}' not found` });
        }

        finalBenchmarkId = benchmarks.id;
      }

      console.log('Using benchmark ID:', finalBenchmarkId);
      const benchmarkRunId = await this.benchmarkEngine.runBenchmark(
        finalBenchmarkId,
        modelId,
        options
      );

      return res.json({
        id: benchmarkRunId,
        message: 'Benchmark started successfully'
      });
    } catch (error) {
      console.error('Error running benchmark:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to run benchmark'
      });
    }
  }

  /**
   * Get benchmark run status
   */
  async getBenchmarkRunStatus(req: Request, res: Response): Promise<Response> {
    const { runId } = req.params;

    try {
      const { data, error } = await supabase
        .from('benchmark_runs')
        .select(`
          id,
          status,
          progress,
          started_at,
          completed_at,
          error,
          duration,
          benchmark_run_models (
            model:models (
              id,
              name,
              provider
            )
          ),
          benchmark_run_benchmarks (
            benchmark:benchmarks (
              id,
              name,
              description
            )
          )
        `)
        .eq('id', runId)
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (!data) {
        return res.status(404).json({ error: 'Benchmark run not found' });
      }

      // Calculate duration if not stored
      const duration = data.duration || (
        data.completed_at ? 
        (new Date(data.completed_at).getTime() - new Date(data.started_at).getTime()) / 1000 :
        (new Date().getTime() - new Date(data.started_at).getTime()) / 1000
      );

      // Transform the data to include model and benchmark information
      const transformedData = {
        id: data.id,
        status: data.status,
        progress: data.progress || 0,
        startTime: data.started_at,
        endTime: data.completed_at,
        duration: `${Math.round(duration)}s`,
        error: data.error,
        model: data.benchmark_run_models?.[0]?.model || null,
        benchmark: data.benchmark_run_benchmarks?.[0]?.benchmark || null
      };

      console.log('Benchmark status response:', JSON.stringify(transformedData, null, 2));
      return res.json(transformedData);
    } catch (error) {
      console.error(`Error fetching benchmark run ${runId}:`, error);
      return res.status(500).json({ error: 'Failed to fetch benchmark run status' });
    }
  }

  /**
   * Get all active benchmark runs
   */
  async getBenchmarkRuns(req: Request, res: Response): Promise<Response> {
    try {
      console.log('Fetching benchmark runs...');
      const { data, error } = await supabase
        .from('benchmark_runs')
        .select(`
          *,
          benchmark_run_models (
            model:models (
              id,
              name,
              provider
            )
          ),
          benchmark_run_benchmarks (
            benchmark:benchmarks (
              id,
              name,
              description
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }

      if (!data) {
        console.log('No data returned from Supabase');
        return res.json([]);
      }

      console.log('Raw data from Supabase:', JSON.stringify(data, null, 2));

      // Transform the data to match the frontend's expected format
      const runs = data.map(run => {
        const modelData = run.benchmark_run_models?.[0]?.model;
        const benchmarkData = run.benchmark_run_benchmarks?.[0]?.benchmark;

        const transformedRun = {
          id: run.id,
          status: run.status,
          progress: run.progress || 0,
          startTime: run.started_at,
          endTime: run.completed_at,
          error: run.error,
          model: modelData ? {
            id: modelData.id,
            name: modelData.name,
            provider: modelData.provider
          } : null,
          benchmark: benchmarkData ? {
            id: benchmarkData.id,
            name: benchmarkData.name,
            description: benchmarkData.description
          } : null
        };

        console.log('Single transformed run:', JSON.stringify(transformedRun, null, 2));
        return transformedRun;
      });

      console.log('All transformed runs:', JSON.stringify(runs, null, 2));
      return res.json(runs);
    } catch (error) {
      console.error('Unexpected error in getBenchmarkRuns:', error);
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch benchmark runs' });
    }
  }

  /**
   * Get benchmark results
   */
  async getBenchmarkResults(req: Request, res: Response): Promise<Response> {
    const { runId } = req.params;

    try {
      const { data: run, error: runError } = await supabase
        .from('benchmark_runs')
        .select(`
          *,
          benchmark_run_benchmarks (
            benchmark:benchmarks (
              id,
              name,
              description
            )
          ),
          benchmark_run_models (
            model:models (
              id,
              name,
              provider
            )
          ),
          benchmark_results (
            id,
            prompt,
            response,
            expected_output,
            score,
            error,
            metrics,
            latency_ms,
            tokens_input,
            tokens_output,
            test_case_id,
            test_cases (
              prompt,
              expected_output,
              evaluation_criteria
            )
          )
        `)
        .eq('id', runId)
        .single();

      if (runError || !run) {
        console.error('Error fetching benchmark run:', runError);
        return res.status(500).json({ error: runError?.message || 'Benchmark run not found' });
      }

      const transformedRun = {
        id: run.id,
        status: run.status,
        progress: run.progress,
        startTime: run.started_at,
        endTime: run.completed_at,
        error: run.error,
        benchmark: run.benchmark_run_benchmarks?.[0]?.benchmark || null,
        model: run.benchmark_run_models?.[0]?.model || null,
        results: (run.benchmark_results || []).map((result: BenchmarkResult) => ({
          id: result.id,
          prompt: result.prompt,
          response: result.response,
          expectedOutput: result.expected_output,
          score: result.score,
          error: result.error,
          metrics: {
            latencyMs: result.latency_ms,
            tokensInput: result.tokens_input,
            tokensOutput: result.tokens_output,
            ...result.metrics
          },
          testCase: result.test_cases
        }))
      };

      return res.json(transformedRun);
    } catch (error) {
      console.error(`Error fetching benchmark results for run ${runId}:`, error);
      return res.status(500).json({ error: 'Failed to fetch benchmark results' });
    }
  }

  /**
   * Get available LLM models from OpenRouter
   */
  async getOpenRouterModels(req: Request, res: Response) {
    try {
      const openRouterConnector = LLMConnectorFactory.getOpenRouterConnector();
      
      if (!openRouterConnector) {
        return res.status(500).json({ error: 'OpenRouter connector is not configured' });
      }

      const models = await openRouterConnector.getAvailableModels();
      
      // Return the full model objects
      return res.json(models);
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch OpenRouter models' 
      });
    }
  }

  /**
   * Register an OpenRouter model in the system
   */
  async registerModel(req: Request, res: Response) {
    const { name, provider, version, description, context_length } = req.body;

    if (!name || !provider || !version) {
      return res.status(400).json({ error: 'Name, provider, and version are required' });
    }

    try {
      // Check if model already exists
      const { data: existing, error: checkError } = await supabase
        .from('models')
        .select('*')
        .eq('provider', provider)
        .eq('name', name)
        .eq('version', version)
        .maybeSingle();

      if (checkError) {
        return res.status(500).json({ error: checkError.message });
      }

      if (existing) {
        return res.status(409).json({ 
          error: 'Model already exists',
          model: existing
        });
      }

      // Register new model
      const { data, error } = await supabase
        .from('models')
        .insert([
          {
            name,
            provider,
            version,
            description,
            context_length: context_length || 4096,
            parameters: {}
          }
        ])
        .select();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json(data[0]);
    } catch (error) {
      console.error('Error registering model:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to register model' 
      });
    }
  }
} 
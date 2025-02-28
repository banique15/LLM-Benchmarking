import { BenchmarkRun, BenchmarkResult, TestCase } from '../../models/Benchmark';
import { Model } from '../../models/Model';
import { LLMConnector, LLMRequestOptions } from '../llm-connectors/LLMConnector';
import { LLMConnectorFactory } from '../llm-connectors/LLMConnectorFactory';
import supabase from '../../db/supabase';

export interface BenchmarkOptions {
  maxConcurrentTests?: number;
  timeoutMs?: number;
  repeatCount?: number;
}

export class BenchmarkEngine {
  private static DEFAULT_OPTIONS: BenchmarkOptions = {
    maxConcurrentTests: 5,
    timeoutMs: 30000, // 30 seconds
    repeatCount: 1
  };

  /**
   * Run a benchmark against a specific model
   */
  async runBenchmark(
    benchmarkId: string,
    modelId: string,
    options: BenchmarkOptions = {}
  ): Promise<string> {
    // Merge options with defaults and ensure all properties are defined
    const mergedOptions: Required<BenchmarkOptions> = {
      maxConcurrentTests: options.maxConcurrentTests ?? BenchmarkEngine.DEFAULT_OPTIONS.maxConcurrentTests!,
      timeoutMs: options.timeoutMs ?? BenchmarkEngine.DEFAULT_OPTIONS.timeoutMs!,
      repeatCount: options.repeatCount ?? BenchmarkEngine.DEFAULT_OPTIONS.repeatCount!
    };

    try {
      // Create a new benchmark run record
      const { data: benchmarkRun, error: createError } = await supabase
        .from('benchmark_runs')
        .insert([
          {
            status: 'running',
            started_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (createError || !benchmarkRun) {
        throw new Error(`Failed to create benchmark run: ${createError?.message}`);
      }

      // Link the benchmark and model to the run
      await supabase.from('benchmark_run_benchmarks').insert([
        {
          benchmark_run_id: benchmarkRun.id,
          benchmark_id: benchmarkId
        }
      ]);

      await supabase.from('benchmark_run_models').insert([
        {
          benchmark_run_id: benchmarkRun.id,
          model_id: modelId
        }
      ]);

      // Start the benchmark process in the background
      this.executeBenchmark(benchmarkRun.id, benchmarkId, modelId, mergedOptions)
        .catch(err => console.error(`Error executing benchmark ${benchmarkRun.id}:`, err));

      return benchmarkRun.id;
    } catch (error) {
      console.error('Error starting benchmark:', error);
      throw error;
    }
  }

  /**
   * Execute the benchmark process
   * This should run asynchronously after returning the benchmark run ID to the client
   */
  private async executeBenchmark(
    benchmarkRunId: string,
    benchmarkId: string,
    modelId: string,
    options: Required<BenchmarkOptions>
  ): Promise<void> {
    try {
      // Fetch test cases for this benchmark
      const { data: testCases, error: testCasesError } = await supabase
        .from('test_cases')
        .select('*')
        .eq('benchmark_id', benchmarkId);

      if (testCasesError || !testCases) {
        throw new Error(`Failed to fetch test cases: ${testCasesError?.message}`);
      }

      // Fetch model information
      const { data: model, error: modelError } = await supabase
        .from('models')
        .select('*')
        .eq('id', modelId)
        .single();

      if (modelError || !model) {
        throw new Error(`Failed to fetch model: ${modelError?.message}`);
      }

      // Get the appropriate connector
      const connector = this.getConnectorForModel(model);
      if (!connector) {
        throw new Error(`No connector available for model: ${model.provider}`);
      }

      // Run test cases in batches to control concurrency
      const results: BenchmarkResult[] = [];
      const batchSize = options.maxConcurrentTests;
      const totalTestCases = testCases.length;
      let completedTestCases = 0;
      
      for (let i = 0; i < testCases.length; i += batchSize) {
        const batch = testCases.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(testCase => this.runTestCase(
            benchmarkRunId, 
            model, 
            testCase, 
            connector, 
            options
          ))
        );
        
        results.push(...batchResults);
        completedTestCases += batch.length;

        // Update progress
        const progress = Math.round((completedTestCases / totalTestCases) * 100);
        await supabase
          .from('benchmark_runs')
          .update({ progress })
          .eq('id', benchmarkRunId);
      }

      // Calculate and save scores
      await this.calculateAndSaveScore(benchmarkRunId, benchmarkId, modelId);

      // Update benchmark run status to completed
      await supabase
        .from('benchmark_runs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          progress: 100
        })
        .eq('id', benchmarkRunId);

    } catch (error) {
      console.error(`Error executing benchmark ${benchmarkRunId}:`, error);

      // Update benchmark run status to failed
      await supabase
        .from('benchmark_runs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        })
        .eq('id', benchmarkRunId);
    }
  }

  /**
   * Run a single test case against a model
   */
  private async runTestCase(
    benchmarkRunId: string,
    model: Model,
    testCase: TestCase,
    connector: LLMConnector,
    options: Required<BenchmarkOptions>
  ): Promise<BenchmarkResult> {
    try {
      // Configure options for the LLM request
      const llmOptions: LLMRequestOptions = {
        model: `${model.provider}/${model.name}`,
        temperature: 0, // Use deterministic output for benchmarking
        max_tokens: 1000,
        ...model.parameters // Add any model-specific parameters
      };

      // Run the test case
      const response = await connector.generateText(testCase.prompt, llmOptions);

      // Basic scoring based on whether expected output is present
      // This is a simple example - in a real system you'd have more sophisticated evaluation
      let score = 0;
      if (testCase.expected_output && response.text.includes(testCase.expected_output)) {
        score = 1;
      }

      // Create result
      return {
        benchmark_run_id: benchmarkRunId,
        model_id: model.id!,
        benchmark_id: testCase.benchmark_id,
        test_case_id: testCase.id!,
        output: response.text,
        score: score,
        metrics: {
          character_count: response.text.length,
          ...response.usage
        },
        latency_ms: response.latency_ms,
        tokens_input: response.usage?.prompt_tokens || 0,
        tokens_output: response.usage?.completion_tokens || 0
      };
    } catch (error) {
      console.error(`Error running test case ${testCase.id}:`, error);
      
      // Return a result with error
      return {
        benchmark_run_id: benchmarkRunId,
        model_id: model.id!,
        benchmark_id: testCase.benchmark_id,
        test_case_id: testCase.id!,
        score: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Calculate overall score for a benchmark run and save it
   */
  private async calculateAndSaveScore(
    benchmarkRunId: string,
    benchmarkId: string,
    modelId: string
  ): Promise<void> {
    // Fetch all results for this benchmark run
    const { data: results, error: resultsError } = await supabase
      .from('benchmark_results')
      .select('*')
      .eq('benchmark_run_id', benchmarkRunId)
      .eq('benchmark_id', benchmarkId)
      .eq('model_id', modelId);

    if (resultsError) {
      throw new Error(`Failed to fetch benchmark results: ${resultsError.message}`);
    }

    if (!results || results.length === 0) {
      return;
    }

    // Calculate average score
    const totalScore = results.reduce((sum, result) => sum + (result.score || 0), 0);
    const averageScore = totalScore / results.length;

    // Calculate average latency
    const validLatencies = results
      .filter(result => typeof result.latency_ms === 'number')
      .map(result => result.latency_ms!);
    
    const averageLatency = validLatencies.length > 0
      ? validLatencies.reduce((sum, latency) => sum + latency, 0) / validLatencies.length
      : null;

    // Save model score
    await supabase
      .from('model_scores')
      .insert([
        {
          benchmark_run_id: benchmarkRunId,
          model_id: modelId,
          benchmark_id: benchmarkId,
          score: averageScore,
          metrics: {
            average_latency_ms: averageLatency,
            successful_tests: results.filter(r => !r.error).length,
            total_tests: results.length
          }
        }
      ]);
  }

  /**
   * Get the appropriate connector for a model
   */
  private getConnectorForModel(model: Model): LLMConnector | undefined {
    // For OpenRouter, we use the OpenRouter connector regardless of the provider
    const openRouterConnector = LLMConnectorFactory.getOpenRouterConnector();
    if (openRouterConnector) {
      return openRouterConnector;
    }

    return undefined;
  }
} 
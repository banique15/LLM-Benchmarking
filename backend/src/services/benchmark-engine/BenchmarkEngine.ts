import { BenchmarkRun, BenchmarkResult, TestCase } from '../../models/Benchmark';
import { Model } from '../../models/Model';
import { LLMConnector, LLMRequestOptions } from '../llm-connectors/LLMConnector';
import { LLMConnectorFactory } from '../llm-connectors/LLMConnectorFactory';
import supabase, { refreshSchemaCache } from '../../db/supabase';

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
        .insert({
          status: 'running',
          progress: 0,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError || !benchmarkRun) {
        throw new Error(`Failed to create benchmark run: ${createError?.message}`);
      }

      // Link the benchmark and model to the run
      await Promise.all([
        supabase
          .from('benchmark_run_benchmarks')
          .insert({ benchmark_run_id: benchmarkRun.id, benchmark_id: benchmarkId }),
        supabase
          .from('benchmark_run_models')
          .insert({ benchmark_run_id: benchmarkRun.id, model_id: modelId })
      ]);

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

      // Get the LLM connector
      const llmConnector = LLMConnectorFactory.getOpenRouterConnector();
      if (!llmConnector) {
        throw new Error('OpenRouter connector is not configured');
      }

      // Construct full model identifier
      const fullModelId = `${model.provider}/${model.name}`;
      console.log('Using model:', fullModelId);

      // Run each test case
      const totalTests = testCases.length;
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        try {
          console.log(`Running test case ${i + 1}/${totalTests}:`, testCase.prompt);
          
          // Generate response from the model
          const startTime = Date.now();
          const response = await llmConnector.generateText(testCase.prompt, {
            model: fullModelId,
            temperature: 0, // Use deterministic output for benchmarking
            max_tokens: 1000,
            ...options
          });
          const duration = Date.now() - startTime;

          console.log('Model response:', response.text);
          
          // Save test result first
          const { data: testResult, error: testResultError } = await supabase
            .from('test_results')
            .insert({
              benchmark_run_id: benchmarkRun.id,
              model_id: modelId,
              test_case_id: testCase.id,
              output: response.text,
              latency_ms: duration,
              tokens_input: response.usage?.prompt_tokens,
              tokens_output: response.usage?.completion_tokens
            })
            .select()
            .single();

          if (testResultError) {
            console.error('Error saving test result:', testResultError);
            throw testResultError;
          }

          // Calculate score and save to test_scores
          const score = this.evaluateResponse(
            response.text,
            testCase.expected_output,
            testCase.evaluation_criteria
          );

          const { error: scoreError } = await supabase
            .from('test_scores')
            .insert({
              test_result_id: testResult.id,
              score: score,
              evaluation_method: 'automatic',
              evaluator_notes: JSON.stringify({
                criteria: testCase.evaluation_criteria,
                expected_output: testCase.expected_output
              })
            });

          if (scoreError) {
            console.error('Error saving test score:', scoreError);
            throw scoreError;
          }

          console.log(`Test case ${i + 1}/${totalTests} completed:`, {
            prompt: testCase.prompt,
            response: response.text,
            score: score
          });

          // Update progress
          await supabase
            .from('benchmark_runs')
            .update({
              progress: ((i + 1) / totalTests) * 100
            })
            .eq('id', benchmarkRun.id);

        } catch (error) {
          console.error(`Error running test case ${testCase.id}:`, error);
          
          // Save failed test result
          const { error: testResultError } = await supabase
            .from('test_results')
            .insert({
              benchmark_run_id: benchmarkRun.id,
              model_id: modelId,
              test_case_id: testCase.id,
              output: null,
              error: error instanceof Error ? error.message : 'Unknown error'
            });

          if (testResultError) {
            console.error('Error saving failed test result:', testResultError);
          }

          // Save zero score for failed test
          const { data: testResult } = await supabase
            .from('test_results')
            .select('id')
            .eq('benchmark_run_id', benchmarkRun.id)
            .eq('test_case_id', testCase.id)
            .single();

          if (testResult) {
            const { error: scoreError } = await supabase
              .from('test_scores')
              .insert({
                test_result_id: testResult.id,
                score: 0,
                evaluation_method: 'automatic',
                evaluator_notes: JSON.stringify({
                  error: error instanceof Error ? error.message : 'Unknown error'
                })
              });

            if (scoreError) {
              console.error('Error saving failed test score:', scoreError);
            }
          }
        }
      }

      // Calculate final scores
      await this.calculateAndSaveScore(benchmarkRun.id, benchmarkId, modelId);

      // Mark benchmark run as completed
      await supabase
        .from('benchmark_runs')
        .update({
          status: 'completed',
          progress: 100,
          completed_at: new Date().toISOString()
        })
        .eq('id', benchmarkRun.id);

      return benchmarkRun.id;
    } catch (error) {
      console.error('Error running benchmark:', error);
      throw error;
    }
  }

  private evaluateResponse(response: string, expectedOutput: string, criteria: any): number {
    // Parse evaluation criteria
    const evaluationRules = criteria ? JSON.parse(criteria) : {};
    
    // Default exact match if no specific criteria
    if (!evaluationRules || Object.keys(evaluationRules).length === 0) {
      return response.trim().toLowerCase() === expectedOutput.trim().toLowerCase() ? 1 : 0;
    }

    // Handle different types of evaluation
    if (evaluationRules.exact_match) {
      return response.trim().toLowerCase() === expectedOutput.trim().toLowerCase() ? 1 : 0;
    }

    if (evaluationRules.keywords) {
      const keywords = evaluationRules.keywords;
      const responseWords = response.toLowerCase().split(/\s+/);
      const matchedKeywords = keywords.filter((keyword: string) => 
        responseWords.includes(keyword.toLowerCase())
      );
      return matchedKeywords.length / keywords.length;
    }

    // Add more evaluation methods as needed
    return 0;
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
    return LLMConnectorFactory.getConnector(model.provider);
  }
} 
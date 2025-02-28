import React from 'react';
import { BenchmarkRunResults } from '../../types/benchmark';

interface TestResult {
  id: string;
  prompt: string;
  response: string;
  expectedOutput: string;
  score: number;
  error?: string;
  metrics: {
    latencyMs?: number;
    tokensInput?: number;
    tokensOutput?: number;
    [key: string]: any;
  };
  testCase: {
    prompt: string;
    expectedOutput: string;
    evaluationCriteria: any;
  };
}

interface BenchmarkRun {
  id: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime?: string;
  error?: string;
  benchmark: {
    id: string;
    name: string;
    description: string;
  };
  model: {
    id: string;
    name: string;
    provider: string;
  };
  results: TestResult[];
}

interface Props {
  run: BenchmarkRunResults;
}

const BenchmarkResultDetails: React.FC<Props> = ({ run }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {run.benchmark?.name || 'Unnamed Benchmark'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {run.benchmark?.description}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Model</p>
            <p className="font-medium">{run.model?.name} ({run.model?.provider})</p>
          </div>
        </div>
      </div>

      {/* Results */}
      {run.results && run.results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Test Results
          </h4>
          <div className="space-y-6">
            {run.results.map((result) => (
              <div key={result.id} className="border dark:border-gray-700 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 dark:text-white">Test Case</h5>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Prompt</p>
                    <p className="mt-1 text-gray-900 dark:text-white">{result.prompt}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Expected Output</p>
                    <p className="mt-1 text-gray-900 dark:text-white">{result.expectedOutput}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h5 className="font-medium text-gray-900 dark:text-white">Model Response</h5>
                  <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-wrap">
                    {result.response}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
                    <p className="mt-1 font-medium text-gray-900 dark:text-white">
                      {result.score.toFixed(2)}
                    </p>
                  </div>
                  {result.metrics.latencyMs && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Latency</p>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {result.metrics.latencyMs}ms
                      </p>
                    </div>
                  )}
                  {result.metrics.tokensInput && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Input Tokens</p>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {result.metrics.tokensInput}
                      </p>
                    </div>
                  )}
                  {result.metrics.tokensOutput && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Output Tokens</p>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {result.metrics.tokensOutput}
                      </p>
                    </div>
                  )}
                </div>

                {result.error && (
                  <div className="mt-4 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                    <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {run.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{run.error}</p>
        </div>
      )}
    </div>
  );
};

export default BenchmarkResultDetails; 
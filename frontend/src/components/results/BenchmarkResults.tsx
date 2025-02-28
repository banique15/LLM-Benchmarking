'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import ResultsFilter from './ResultsFilter';
import ResultsSort from './ResultsSort';
import BenchmarkResultDetails from './BenchmarkResultDetails';
import { BenchmarkRunResults } from '../../types/benchmark';

interface Filters {
  model?: string;
  benchmarkType?: string;
  dateRange?: string;
}

interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}

const BenchmarkResults: React.FC = () => {
  const [runs, setRuns] = useState<BenchmarkRunResults[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRun, setSelectedRun] = useState<string | null>(null);
  const [runDetails, setRunDetails] = useState<BenchmarkRunResults | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [sort, setSort] = useState<Sort>({ field: 'date', direction: 'desc' });

  const uniqueModels = useMemo(() => {
    const models = new Set<string>();
    runs.forEach(run => {
      if (run.model?.name) {
        models.add(run.model.name);
      }
    });
    return Array.from(models);
  }, [runs]);

  const uniqueBenchmarkTypes = useMemo(() => {
    const types = new Set<string>();
    runs.forEach(run => {
      if (run.benchmark?.name) {
        types.add(run.benchmark.name);
      }
    });
    return Array.from(types);
  }, [runs]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await axios.get<BenchmarkRunResults[]>(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/benchmarks/status`
        );
        console.log('API Response:', response.data);
        setRuns(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching benchmark results:', err);
        setError('Failed to load benchmark results. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchResults();

    // Set up polling
    const interval = setInterval(fetchResults, 10000);

    // Cleanup
    return () => clearInterval(interval);
  }, []); // Empty dependency array since fetchResults is defined inside useEffect

  useEffect(() => {
    const fetchRunDetails = async (runId: string) => {
      try {
        setLoading(true);
        const response = await axios.get<BenchmarkRunResults>(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/benchmarks/${runId}/results`
        );
        setRunDetails(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching run details:', err);
        setError('Failed to load benchmark details');
      } finally {
        setLoading(false);
      }
    };

    if (selectedRun) {
      fetchRunDetails(selectedRun);
    } else {
      setRunDetails(null);
    }
  }, [selectedRun]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getChartData = (run: BenchmarkRunResults) => {
    if (!run.results) return [];
    
    return run.results.map(result => ({
      name: `Test ${result.id}`,
      score: result.score || 0,
      latency: result.metrics.latencyMs || 0,
    }));
  };

  const filterRuns = useMemo(() => {
    return (runs: BenchmarkRunResults[]) => {
      return runs.filter(run => {
        if (filters.model && run.model?.name !== filters.model) {
          return false;
        }
        if (filters.benchmarkType && run.benchmark?.name !== filters.benchmarkType) {
          return false;
        }
        if (filters.dateRange) {
          const runDate = new Date(run.startTime);
          const now = new Date();
          const daysDiff = (now.getTime() - runDate.getTime()) / (1000 * 60 * 60 * 24);
          
          switch (filters.dateRange) {
            case 'today':
              return daysDiff < 1;
            case 'week':
              return daysDiff < 7;
            case 'month':
              return daysDiff < 30;
            case 'quarter':
              return daysDiff < 90;
            default:
              return true;
          }
        }
        return true;
      });
    };
  }, [filters]);

  const sortRuns = useMemo(() => {
    return (runs: BenchmarkRunResults[]) => {
      return [...runs].sort((a, b) => {
        switch (sort.field) {
          case 'date':
            const dateA = new Date(a.startTime).getTime();
            const dateB = new Date(b.startTime).getTime();
            return sort.direction === 'desc' ? dateB - dateA : dateA - dateB;
          
          case 'score':
            const scoreA = a.results?.[0]?.score || 0;
            const scoreB = b.results?.[0]?.score || 0;
            return sort.direction === 'desc' ? scoreB - scoreA : scoreA - scoreB;
          
          case 'model':
            const modelA = a.model?.name?.toLowerCase() || '';
            const modelB = b.model?.name?.toLowerCase() || '';
            return sort.direction === 'desc'
              ? modelB.localeCompare(modelA)
              : modelA.localeCompare(modelB);
          
          default:
            return 0;
        }
      });
    };
  }, [sort]);

  const filteredAndSortedRuns = useMemo(() => {
    const filtered = filterRuns(runs);
    return sortRuns(filtered);
  }, [runs, filterRuns, sortRuns]);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSortChange = (newSort: Sort) => {
    setSort(newSort);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ResultsFilter
        models={uniqueModels}
        benchmarkTypes={uniqueBenchmarkTypes}
        onFilterChange={handleFilterChange}
      />

      <ResultsSort onSortChange={handleSortChange} />

      {loading && (
        <div className="text-center">
          <p>Loading results...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {runDetails && <BenchmarkResultDetails run={runDetails} />}

      {!loading && filteredAndSortedRuns.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">No Results Available</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {Object.keys(filters).length > 0 
              ? 'Try adjusting your filters to see more results.'
              : 'Run some benchmarks to see their results here.'}
          </p>
        </div>
      )}

      {filteredAndSortedRuns.length > 0 && (
        <div className="grid grid-cols-1 gap-8">
          {filteredAndSortedRuns.map((run) => (
            <div
              key={run.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {run.model?.name || 'Unknown Model'} - {run.benchmark?.name || 'Unknown Benchmark'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Run started: {formatDate(run.startTime)}
                  </p>
                  {run.model?.provider && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Provider: {run.model.provider}
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    run.status === 'running'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : run.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                </span>
              </div>

              {run.results && run.results.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Test Results
                  </h4>
                  <div className="space-y-4">
                    {run.results.map((result) => (
                      <div key={result.id} className="border rounded-lg p-4">
                        <h5 className="font-medium">Test Case</h5>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <p className="text-sm text-gray-500">Prompt</p>
                            <p className="mt-1">{result.prompt}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Expected Output</p>
                            <p className="mt-1">{result.expectedOutput}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <h5 className="font-medium">Model Response</h5>
                          <p className="mt-1 whitespace-pre-wrap">{result.response}</p>
                        </div>

                        <div className="mt-4 grid grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Score</p>
                            <p className="mt-1 font-medium">{result.score?.toFixed(2) || 'N/A'}</p>
                          </div>
                          {result.metrics?.latencyMs && (
                            <div>
                              <p className="text-sm text-gray-500">Latency</p>
                              <p className="mt-1">{result.metrics.latencyMs}ms</p>
                            </div>
                          )}
                          {result.metrics?.tokensInput && (
                            <div>
                              <p className="text-sm text-gray-500">Input Tokens</p>
                              <p className="mt-1">{result.metrics.tokensInput}</p>
                            </div>
                          )}
                          {result.metrics?.tokensOutput && (
                            <div>
                              <p className="text-sm text-gray-500">Output Tokens</p>
                              <p className="mt-1">{result.metrics.tokensOutput}</p>
                            </div>
                          )}
                        </div>

                        {result.error && (
                          <div className="mt-4">
                            <p className="text-sm text-red-600">{result.error}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {run.error && (
                <div className="mt-4 text-red-600 dark:text-red-400">
                  Error: {run.error}
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={() => setSelectedRun(selectedRun === run.id ? null : run.id)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  {selectedRun === run.id ? 'Hide Details' : 'Show Details'}
                </button>

                {selectedRun === run.id && run.results && (
                  <div className="mt-4 space-y-4">
                    {run.results.map((result) => (
                      <div
                        key={result.id}
                        className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                      >
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                          Test Case Output
                        </h5>
                        <pre className="bg-gray-100 dark:bg-gray-600 p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                          {result.response}
                        </pre>
                        {result.error && (
                          <p className="mt-2 text-red-600 dark:text-red-400">
                            Error: {result.error}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BenchmarkResults; 
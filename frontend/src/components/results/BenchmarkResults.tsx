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

interface BenchmarkResult {
  id: string;
  modelName: string;
  benchmarkType: string;
  score: number;
  metrics: {
    accuracy?: number;
    latency?: number;
    tokens?: number;
    [key: string]: any;
  };
  output: string;
  error?: string;
  created_at: string;
}

interface BenchmarkRun {
  id: string;
  modelId: string;
  modelName: string;
  benchmarkType: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime?: string;
  results?: BenchmarkResult[];
  error?: string;
}

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
  const [runs, setRuns] = useState<BenchmarkRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRun, setSelectedRun] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [sort, setSort] = useState<Sort>({ field: 'date', direction: 'desc' });

  const uniqueModels = useMemo(() => {
    const models = new Set<string>();
    runs.forEach(run => models.add(run.modelName));
    return Array.from(models);
  }, [runs]);

  const uniqueBenchmarkTypes = useMemo(() => {
    const types = new Set<string>();
    runs.forEach(run => types.add(run.benchmarkType));
    return Array.from(types);
  }, [runs]);

  useEffect(() => {
    fetchResults();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get<BenchmarkRun[]>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/benchmarks/status`
      );
      setRuns(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching benchmark results:', err);
      setError('Failed to load benchmark results. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getChartData = (run: BenchmarkRun) => {
    if (!run.results) return [];
    
    return run.results.map(result => ({
      name: result.modelName,
      score: result.score || 0,
      accuracy: result.metrics.accuracy || 0,
      latency: result.metrics.latency || 0,
    }));
  };

  const filterRuns = (runs: BenchmarkRun[]) => {
    return runs.filter(run => {
      if (filters.model && run.modelName !== filters.model) {
        return false;
      }
      if (filters.benchmarkType && run.benchmarkType !== filters.benchmarkType) {
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

  const sortRuns = (runs: BenchmarkRun[]) => {
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
          const modelA = a.modelName.toLowerCase();
          const modelB = b.modelName.toLowerCase();
          return sort.direction === 'desc'
            ? modelB.localeCompare(modelA)
            : modelA.localeCompare(modelB);
        
        default:
          return 0;
      }
    });
  };

  const filteredAndSortedRuns = useMemo(() => {
    const filtered = filterRuns(runs);
    return sortRuns(filtered);
  }, [runs, filters, sort]);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSortChange = (newSort: Sort) => {
    setSort(newSort);
  };

  return (
    <div className="space-y-8">
      <ResultsFilter
        models={uniqueModels}
        benchmarkTypes={uniqueBenchmarkTypes}
        onFilterChange={handleFilterChange}
      />

      <ResultsSort onSortChange={handleSortChange} />

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded shadow-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading && runs.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 dark:border-blue-400"></div>
        </div>
      )}

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
                    {run.modelName} - {run.benchmarkType}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Run started: {formatDate(run.startTime)}
                  </p>
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
                    Performance Metrics
                  </h4>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getChartData(run)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" fill="#3B82F6" name="Overall Score" />
                        <Bar dataKey="accuracy" fill="#10B981" name="Accuracy" />
                        <Bar dataKey="latency" fill="#F59E0B" name="Latency (ms)" />
                      </BarChart>
                    </ResponsiveContainer>
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
                        <pre className="bg-gray-100 dark:bg-gray-600 p-3 rounded text-sm overflow-x-auto">
                          {result.output}
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
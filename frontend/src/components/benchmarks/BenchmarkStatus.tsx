'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { BenchmarkRunStatus } from '../../types/benchmark';

type SortField = 'started_at' | 'status' | 'model' | 'benchmark';
type SortOrder = 'asc' | 'desc';
type BenchmarkStatus = 'running' | 'completed' | 'failed';

const BenchmarkStatus: React.FC = () => {
  const [runs, setRuns] = useState<BenchmarkRunStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('started_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchStatus = async () => {
    try {
      const response = await axios.get<BenchmarkRunStatus[]>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/benchmarks/status`
      );
      console.log('API Response:', response.data);
      setRuns(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching benchmark status:', err);
      setError('Failed to load benchmark status. Please try again later.');
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStatus().finally(() => setLoading(false));

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (startTime: string, endTime?: string | null) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000); // in seconds

    if (duration < 60) {
      return `${duration}s`;
    } else if (duration < 3600) {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return `${minutes}m ${seconds}s`;
    } else {
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const sortedAndFilteredRuns = useMemo(() => {
    let filteredRuns = runs;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filteredRuns = runs.filter(run => run.status === statusFilter);
    }

    // Apply sorting
    return [...filteredRuns].sort((a, b) => {
      switch (sortField) {
        case 'started_at':
          return sortOrder === 'asc' 
            ? new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            : new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        case 'status':
          return sortOrder === 'asc'
            ? a.status.localeCompare(b.status)
            : b.status.localeCompare(a.status);
        case 'model':
          const modelNameA = a.model?.name || '';
          const modelNameB = b.model?.name || '';
          return sortOrder === 'asc'
            ? modelNameA.localeCompare(modelNameB)
            : modelNameB.localeCompare(modelNameA);
        case 'benchmark':
          const benchmarkNameA = a.benchmark?.name || '';
          const benchmarkNameB = b.benchmark?.name || '';
          return sortOrder === 'asc'
            ? benchmarkNameA.localeCompare(benchmarkNameB)
            : benchmarkNameB.localeCompare(benchmarkNameA);
        default:
          return 0;
      }
    });
  }, [runs, sortField, sortOrder, statusFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Benchmark Status</h2>
        <div className="flex gap-4">
          <select
            className="bg-gray-800 text-gray-300 border border-gray-700 rounded-md px-3 py-1 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <button
            onClick={fetchStatus}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md text-sm transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border-l-4 border-red-500 text-red-200 p-4 rounded mb-6">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading && runs.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {!loading && runs.length === 0 && !error && (
        <div className="text-center py-12">
          <h3 className="text-sm font-medium text-gray-200">No Active Benchmarks</h3>
          <p className="mt-1 text-sm text-gray-400">
            Start a new benchmark to see its status here.
          </p>
        </div>
      )}

      {sortedAndFilteredRuns.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {sortedAndFilteredRuns.map((run) => (
            <div
              key={run.id}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1">
                  <div className="text-white font-medium">
                    {run.model?.name || 'Unknown Model'}
                  </div>
                  <div className="text-sm text-gray-400">
                    {run.model?.provider || 'Unknown Provider'}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium
                    ${(run.status as BenchmarkStatus) === 'running' ? 'bg-blue-900/50 text-blue-200' :
                      (run.status as BenchmarkStatus) === 'completed' ? 'bg-green-900/50 text-green-200' :
                      'bg-red-900/50 text-red-200'}`}>
                    {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <div>
                  <div className="text-gray-300 font-medium mb-1">
                    {run.benchmark?.name || 'Unknown Benchmark'}
                  </div>
                  <div className="text-sm text-gray-500 line-clamp-2">
                    {run.benchmark?.description || 'No description available'}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Progress</span>
                    <span>{run.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        (run.status as BenchmarkStatus) === 'failed' ? 'bg-red-500' :
                        (run.status as BenchmarkStatus) === 'completed' ? 'bg-green-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${run.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="space-y-0.5">
                    <div>Started: {new Date(run.startTime).toLocaleTimeString()}</div>
                    {run.endTime && (
                      <div>Completed: {new Date(run.endTime).toLocaleTimeString()}</div>
                    )}
                  </div>
                  <div className="text-right">
                    Duration: {formatDuration(run.startTime, run.endTime)}
                  </div>
                </div>

                {run.error && (
                  <div className="mt-2 text-sm text-red-400 bg-red-900/20 p-2 rounded">
                    {run.error}
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

export default BenchmarkStatus;
'use client';

import React from 'react';
import ModelList from '../../components/models/ModelList';
import ModelRegistration from '../../components/models/ModelRegistration';

export default function ModelsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Models Management</h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Register and manage LLM models for benchmarking. You can add models from OpenRouter or view existing models.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="lg:order-1 order-2">
          <div className="sticky top-8">
            <ModelRegistration />
          </div>
        </div>
        <div className="lg:order-2 order-1">
          <ModelList />
        </div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 p-4 rounded-md shadow-sm mt-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700 dark:text-blue-200">
              Models registered here will be available for selection when running benchmarks. Each model can be tested against various benchmarks to evaluate performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
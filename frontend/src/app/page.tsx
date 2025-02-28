'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 md:p-24 bg-gradient-to-b from-white to-blue-50">
      <div className="z-10 w-full max-w-5xl items-center justify-between">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-gray-900 animate-fadeIn">
            LLM Benchmarking Platform
          </h1>
          <div className="h-1 w-24 bg-blue-600 mx-auto mb-8 rounded-full"></div>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            A comprehensive platform for testing, benchmarking, and comparing Large Language Models (LLMs) 
            across various metrics and generating detailed reports and rankings.
          </p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100">  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <Link href="/models" className="block transform transition-all duration-300 hover:scale-105">
              <div className="border border-gray-200 p-8 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer shadow-sm hover:shadow-md group h-full">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">Model Management</h2>
                </div>
                <p className="text-gray-600 group-hover:text-gray-800 transition-colors">
                  Register and manage LLM models from OpenRouter for benchmarking. Configure model settings and manage your model library.
                </p>
              </div>
            </Link>
            
            <Link href="/benchmarks" className="block transform transition-all duration-300 hover:scale-105">
              <div className="border border-gray-200 p-8 rounded-xl hover:bg-green-50 hover:border-green-200 transition-colors cursor-pointer shadow-sm hover:shadow-md group h-full">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-lg mr-4 group-hover:bg-green-200 transition-colors">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">Run Benchmarks</h2>
                </div>
                <p className="text-gray-600 group-hover:text-gray-800 transition-colors">
                  Create and run benchmark tests to evaluate model performance across different tasks and challenges.
                </p>
              </div>
            </Link>
            
            <Link href="/results" className="block transform transition-all duration-300 hover:scale-105">
              <div className="border border-gray-200 p-8 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-colors cursor-pointer shadow-sm hover:shadow-md group h-full">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">View Results</h2>
                </div>
                <p className="text-gray-600 group-hover:text-gray-800 transition-colors">
                  Analyze benchmark results and compare model performance with interactive charts and visualizations.
                </p>
              </div>
            </Link>
            
            <Link href="/reports" className="block transform transition-all duration-300 hover:scale-105">
              <div className="border border-gray-200 p-8 rounded-xl hover:bg-amber-50 hover:border-amber-200 transition-colors cursor-pointer shadow-sm hover:shadow-md group h-full">
                <div className="flex items-center mb-4">
                  <div className="bg-amber-100 p-3 rounded-lg mr-4 group-hover:bg-amber-200 transition-colors">
                    <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 group-hover:text-amber-700 transition-colors">Generate Reports</h2>
                </div>
                <p className="text-gray-600 group-hover:text-gray-800 transition-colors">
                  Create comprehensive reports based on benchmark results with shareable insights and recommendations.
                </p>
              </div>
            </Link>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6 text-lg">
              Get started by configuring models from OpenRouter
            </p>
            <Link
              href="/models"
              className="inline-flex justify-center py-3 px-8 border border-transparent shadow-lg text-base font-medium rounded-full text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
      
      <footer className="mt-16 w-full text-center text-gray-600 text-sm">
        <p>LLM Benchmarking Platform © {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface ReportsData {
  totalBenchmarks: number;
  modelsTested: number;
  successRate: number;
  averageResponseTime: number;
  recentBenchmarks: {
    name: string;
    score: number;
    status: string;
    date: string;
  }[];
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('summary');
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/reports');
        if (!response.ok) {
          throw new Error('Failed to fetch reports data');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <p>Loading reports data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
      </div>

      <Tabs defaultValue="summary" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="comparison">Model Comparison</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <h3 className="text-sm font-medium">Total Benchmarks</h3>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{data?.totalBenchmarks || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <h3 className="text-sm font-medium">Models Tested</h3>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{data?.modelsTested || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <h3 className="text-sm font-medium">Success Rate</h3>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{data?.successRate || 0}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <h3 className="text-sm font-medium">Avg. Response Time</h3>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{data?.averageResponseTime || 0}ms</p>
              </CardContent>
            </Card>
          </div>

          <Card className="w-full">
            <CardHeader>
              <h3 className="text-lg font-medium">Recent Benchmark Performance</h3>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.recentBenchmarks || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#8884d8" name="Performance Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Model Performance Comparison</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Performance Trends Over Time</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Detailed Benchmark Analysis</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
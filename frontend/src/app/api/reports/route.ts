import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Fetch total number of benchmarks
    const { count: totalBenchmarks } = await supabase
      .from('benchmark_runs')
      .select('*', { count: 'exact', head: true });

    // Fetch unique models tested
    const { data: modelsData } = await supabase
      .from('benchmark_runs')
      .select('model_name');
    
    const uniqueModels = Array.from(new Set(modelsData?.map(m => m.model_name) || []));

    // Fetch success rate
    const { data: successData } = await supabase
      .from('benchmark_runs')
      .select('status');

    const successRate = successData
      ? (successData.filter(run => run.status === 'completed').length / successData.length) * 100
      : 0;

    // Fetch average response time
    const { data: avgResponseTime } = await supabase
      .from('benchmark_results')
      .select('response_time')
      .not('response_time', 'is', null);

    const averageTime = avgResponseTime
      ? avgResponseTime.reduce((acc, curr) => acc + curr.response_time, 0) / avgResponseTime.length
      : 0;

    // Fetch recent benchmark performance
    const { data: recentBenchmarks } = await supabase
      .from('benchmark_runs')
      .select(`
        id,
        model_name,
        created_at,
        status,
        benchmark_results (
          score
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    const formattedRecentBenchmarks = recentBenchmarks?.map(benchmark => ({
      name: benchmark.model_name,
      score: benchmark.benchmark_results?.[0]?.score || 0,
      status: benchmark.status,
      date: new Date(benchmark.created_at).toLocaleDateString()
    })) || [];

    return NextResponse.json({
      totalBenchmarks: totalBenchmarks || 0,
      modelsTested: uniqueModels.length,
      successRate: Math.round(successRate * 100) / 100,
      averageResponseTime: Math.round(averageTime),
      recentBenchmarks: formattedRecentBenchmarks
    });
  } catch (error) {
    console.error('Error fetching reports data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports data' },
      { status: 500 }
    );
  }
} 
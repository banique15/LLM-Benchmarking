import axios, { isAxiosError } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL_NAME = 'anthropic/claude-3-haiku';

interface BenchmarkTest {
  prompt: string;
  expectedOutput: string;
}

const testCases: BenchmarkTest[] = [
  {
    prompt: "What is 2+2? Please respond with just the number.",
    expectedOutput: "4"
  },
  {
    prompt: "What is the capital of France? Please respond with just the city name.",
    expectedOutput: "Paris"
  },
  {
    prompt: "Is water wet? Please respond with just yes or no.",
    expectedOutput: "yes"
  }
];

async function runTest(test: BenchmarkTest) {
  const startTime = Date.now();
  
  const requestBody = {
    model: MODEL_NAME,
    messages: [
      {
        role: 'user',
        content: test.prompt
      }
    ]
  };

  console.log('Making API request with:', {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: MODEL_NAME,
    headers: {
      'Authorization': 'Bearer <redacted>',
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://llm-benchmarking-platform',
      'X-Title': 'LLM Benchmarking Platform'
    },
    body: requestBody
  });
  
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://llm-benchmarking-platform',
          'X-Title': 'LLM Benchmarking Platform'
        }
      }
    );

    const endTime = Date.now();
    const duration = endTime - startTime;
    const modelResponse = response.data.choices[0].message.content.trim();
    
    // Calculate simple string similarity score (0-1)
    const similarity = calculateSimilarity(modelResponse.toLowerCase(), test.expectedOutput.toLowerCase());
    
    return {
      prompt: test.prompt,
      expectedOutput: test.expectedOutput,
      modelResponse,
      duration,
      similarity,
      tokensUsed: response.data.usage.total_tokens
    };
  } catch (error) {
    console.error('Error running test:', error);
    let errorMessage = 'Unknown error';
    if (isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
      console.error('API Response:', error.response?.data);
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      prompt: test.prompt,
      expectedOutput: test.expectedOutput,
      modelResponse: 'Error: ' + errorMessage,
      duration: Date.now() - startTime,
      similarity: 0,
      tokensUsed: 0,
      error: errorMessage
    };
  }
}

// Simple string similarity function (Levenshtein distance based)
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (str1.length === 0) return 0;
  if (str2.length === 0) return 0;

  const matrix = Array(str2.length + 1).fill(null).map(() => 
    Array(str1.length + 1).fill(null)
  );

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + substitutionCost
      );
    }
  }

  const distance = matrix[str2.length][str1.length];
  const maxLength = Math.max(str1.length, str2.length);
  return 1 - (distance / maxLength);
}

async function runAllTests() {
  console.log(`Starting benchmark tests for ${MODEL_NAME}`);
  console.log('----------------------------------------');

  const results = [];
  for (const test of testCases) {
    console.log(`Running test: "${test.prompt}"`);
    const result = await runTest(test);
    results.push(result);
    
    console.log('Expected:', result.expectedOutput);
    console.log('Response:', result.modelResponse);
    console.log('Duration:', result.duration + 'ms');
    console.log('Similarity Score:', (result.similarity * 100).toFixed(2) + '%');
    console.log('Tokens Used:', result.tokensUsed);
    if (result.error) {
      console.log('Error:', result.error);
    }
    console.log('----------------------------------------');
  }

  // Calculate and display aggregate metrics
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  const avgSimilarity = results.reduce((sum, r) => sum + r.similarity, 0) / results.length;
  const totalTokens = results.reduce((sum, r) => sum + r.tokensUsed, 0);
  
  console.log('\nBenchmark Summary:');
  console.log('Average Response Time:', avgDuration.toFixed(2) + 'ms');
  console.log('Average Accuracy:', (avgSimilarity * 100).toFixed(2) + '%');
  console.log('Total Tokens Used:', totalTokens);
}

// Run the tests
if (OPENROUTER_API_KEY) {
  runAllTests().catch(console.error);
} else {
  console.error('Please set OPENROUTER_API_KEY in your environment variables');
} 
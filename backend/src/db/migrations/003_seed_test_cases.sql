-- Insert test cases for each benchmark
WITH benchmarks AS (
  SELECT id, name FROM benchmarks
)
INSERT INTO test_cases (benchmark_id, prompt, expected_output, evaluation_criteria, weight, tags)
SELECT 
  b.id,
  CASE 
    WHEN b.name = 'reasoning' THEN 'Solve this logical puzzle: If all A are B, and all B are C, what can we conclude about A and C?'
    WHEN b.name = 'knowledge' THEN 'What is the capital of France and what is its population?'
    WHEN b.name = 'creativity' THEN 'Write a short story about a robot discovering emotions for the first time.'
    WHEN b.name = 'coding' THEN 'Write a function in Python that finds the nth Fibonacci number using dynamic programming.'
    WHEN b.name = 'conversation' THEN 'You are helping a customer who is frustrated with a delayed delivery. Respond professionally and empathetically.'
  END,
  CASE 
    WHEN b.name = 'reasoning' THEN 'All A are C. This follows from the transitive property of logical implication.'
    WHEN b.name = 'knowledge' THEN 'Paris is the capital of France with a population of approximately 2.2 million people in the city proper.'
    WHEN b.name = 'creativity' THEN NULL -- Creative tasks don''t have fixed expected outputs
    WHEN b.name = 'coding' THEN 'def fibonacci(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]'
    WHEN b.name = 'conversation' THEN 'I understand your frustration with the delayed delivery, and I sincerely apologize for any inconvenience this has caused. Let me help you track your order and find a solution.'
  END,
  jsonb_build_object(
    'criteria', CASE 
      WHEN b.name = 'reasoning' THEN ARRAY['logical_validity', 'clarity_of_explanation']
      WHEN b.name = 'knowledge' THEN ARRAY['factual_accuracy', 'completeness']
      WHEN b.name = 'creativity' THEN ARRAY['originality', 'coherence', 'emotional_impact']
      WHEN b.name = 'coding' THEN ARRAY['correctness', 'efficiency', 'code_style']
      WHEN b.name = 'conversation' THEN ARRAY['empathy', 'professionalism', 'solution_oriented']
    END
  ),
  1.0,
  CASE 
    WHEN b.name = 'reasoning' THEN ARRAY['logic', 'deduction']
    WHEN b.name = 'knowledge' THEN ARRAY['geography', 'demographics']
    WHEN b.name = 'creativity' THEN ARRAY['story', 'emotions', 'robots']
    WHEN b.name = 'coding' THEN ARRAY['algorithms', 'dynamic-programming']
    WHEN b.name = 'conversation' THEN ARRAY['customer-service', 'empathy']
  END
FROM benchmarks b
ON CONFLICT DO NOTHING;

-- Add a few more test cases for each benchmark type
WITH benchmarks AS (
  SELECT id, name FROM benchmarks
)
INSERT INTO test_cases (benchmark_id, prompt, expected_output, evaluation_criteria, weight, tags)
SELECT 
  b.id,
  CASE 
    WHEN b.name = 'reasoning' THEN 'In a room of 30 people, if each person shakes hands with everyone else exactly once, how many handshakes occur in total?'
    WHEN b.name = 'knowledge' THEN 'Explain the process of photosynthesis in plants.'
    WHEN b.name = 'creativity' THEN 'Compose a haiku about artificial intelligence.'
    WHEN b.name = 'coding' THEN 'Write a function that determines if a string is a palindrome, ignoring spaces and punctuation.'
    WHEN b.name = 'conversation' THEN 'A user is reporting that your software is running slowly. Help them troubleshoot the issue.'
  END,
  CASE 
    WHEN b.name = 'reasoning' THEN '435 handshakes. This can be calculated using the formula (n * (n-1)) / 2, where n is the number of people.'
    WHEN b.name = 'knowledge' THEN 'Photosynthesis is the process by which plants convert light energy into chemical energy. Plants use sunlight, water, and carbon dioxide to produce glucose and oxygen.'
    WHEN b.name = 'creativity' THEN NULL
    WHEN b.name = 'coding' THEN 'def is_palindrome(s):
    # Remove spaces and punctuation, convert to lowercase
    s = "".join(c.lower() for c in s if c.isalnum())
    return s == s[::-1]'
    WHEN b.name = 'conversation' THEN 'I understand you''re experiencing performance issues. Let''s work together to identify what might be causing the slowdown. Could you tell me what you were doing when you noticed the software running slowly?'
  END,
  jsonb_build_object(
    'criteria', CASE 
      WHEN b.name = 'reasoning' THEN ARRAY['problem_solving', 'mathematical_reasoning']
      WHEN b.name = 'knowledge' THEN ARRAY['scientific_accuracy', 'explanation_clarity']
      WHEN b.name = 'creativity' THEN ARRAY['poetic_form', 'theme_relevance']
      WHEN b.name = 'coding' THEN ARRAY['correctness', 'edge_cases', 'efficiency']
      WHEN b.name = 'conversation' THEN ARRAY['troubleshooting', 'clear_communication']
    END
  ),
  1.0,
  CASE 
    WHEN b.name = 'reasoning' THEN ARRAY['math', 'combinatorics']
    WHEN b.name = 'knowledge' THEN ARRAY['biology', 'science']
    WHEN b.name = 'creativity' THEN ARRAY['poetry', 'haiku', 'AI']
    WHEN b.name = 'coding' THEN ARRAY['strings', 'algorithms']
    WHEN b.name = 'conversation' THEN ARRAY['technical-support', 'troubleshooting']
  END
FROM benchmarks b
ON CONFLICT DO NOTHING; 
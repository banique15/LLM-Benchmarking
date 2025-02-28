-- Insert benchmark categories if they don't exist
INSERT INTO benchmark_categories (name, description)
VALUES 
  ('reasoning', 'Tests for logical reasoning and problem-solving capabilities'),
  ('knowledge', 'Tests for factual knowledge and information retrieval'),
  ('creativity', 'Tests for creative writing and idea generation'),
  ('coding', 'Tests for code generation and debugging capabilities'),
  ('conversation', 'Tests for conversation and chat capabilities')
ON CONFLICT (name) DO NOTHING;

-- Insert benchmarks for each category
WITH categories AS (
  SELECT id, name FROM benchmark_categories
)
INSERT INTO benchmarks (name, category_id, description, parameters)
SELECT 
  c.name,
  c.id,
  CASE 
    WHEN c.name = 'reasoning' THEN 'Evaluates the model''s ability to solve complex reasoning tasks'
    WHEN c.name = 'knowledge' THEN 'Tests the model''s knowledge retrieval and factual accuracy'
    WHEN c.name = 'creativity' THEN 'Assesses the model''s creative writing and idea generation'
    WHEN c.name = 'coding' THEN 'Tests the model''s ability to generate and analyze code'
    WHEN c.name = 'conversation' THEN 'Evaluates the model''s conversational abilities'
  END,
  '{}'::jsonb
FROM categories c
ON CONFLICT (name) DO NOTHING; 
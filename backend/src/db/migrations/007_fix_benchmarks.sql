-- First, clear existing data
DELETE FROM benchmarks;
DELETE FROM benchmark_categories;

-- Insert benchmark categories with proper names
INSERT INTO benchmark_categories (name, description)
VALUES 
  ('Reasoning', 'Tests for logical reasoning and problem-solving capabilities'),
  ('Knowledge', 'Tests for factual knowledge and information retrieval'),
  ('Creativity', 'Tests for creative writing and idea generation'),
  ('Coding', 'Tests for code generation and debugging capabilities'),
  ('Conversation', 'Tests for conversation and chat capabilities')
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
    WHEN c.name = 'Reasoning' THEN 'Evaluates the model''s ability to solve complex reasoning tasks'
    WHEN c.name = 'Knowledge' THEN 'Tests the model''s knowledge retrieval and factual accuracy'
    WHEN c.name = 'Creativity' THEN 'Assesses the model''s creative writing and idea generation'
    WHEN c.name = 'Coding' THEN 'Tests the model''s ability to generate and analyze code'
    WHEN c.name = 'Conversation' THEN 'Evaluates the model''s conversational abilities'
  END,
  '{}'::jsonb
FROM categories c
ON CONFLICT (name) DO NOTHING; 
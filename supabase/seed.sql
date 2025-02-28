-- Seed data for LLM benchmarking

-- Insert sample benchmarks
INSERT INTO benchmarks (name, description, category)
VALUES 
    ('General Knowledge', 'Tests the model''s ability to answer general knowledge questions', 'knowledge'),
    ('Reasoning', 'Tests the model''s logical reasoning capabilities', 'reasoning'),
    ('Coding', 'Tests the model''s ability to write and debug code', 'coding'),
    ('Summarization', 'Tests the model''s ability to summarize text', 'language'),
    ('Translation', 'Tests the model''s ability to translate between languages', 'language');

-- Insert sample test cases for General Knowledge benchmark
INSERT INTO test_cases (benchmark_id, prompt, expected_output, evaluation_criteria, weight)
VALUES 
    (
        (SELECT id FROM benchmarks WHERE name = 'General Knowledge' LIMIT 1),
        'What is the capital of France?',
        'Paris',
        '{"exact_match": true, "case_sensitive": false}',
        1.0
    ),
    (
        (SELECT id FROM benchmarks WHERE name = 'General Knowledge' LIMIT 1),
        'Who wrote the novel "1984"?',
        'George Orwell',
        '{"exact_match": true, "case_sensitive": false}',
        1.0
    ),
    (
        (SELECT id FROM benchmarks WHERE name = 'General Knowledge' LIMIT 1),
        'What is the chemical symbol for gold?',
        'Au',
        '{"exact_match": true, "case_sensitive": true}',
        1.0
    );

-- Insert sample test cases for Reasoning benchmark
INSERT INTO test_cases (benchmark_id, prompt, expected_output, evaluation_criteria, weight)
VALUES 
    (
        (SELECT id FROM benchmarks WHERE name = 'Reasoning' LIMIT 1),
        'If a shirt costs $25 and is on sale for 20% off, what is the final price?',
        '$20',
        '{"exact_match": true, "case_sensitive": false}',
        1.0
    ),
    (
        (SELECT id FROM benchmarks WHERE name = 'Reasoning' LIMIT 1),
        'If all A are B, and all B are C, what can we conclude about A and C?',
        'All A are C',
        '{"exact_match": false, "keywords": ["all A are C"]}',
        1.0
    );

-- Insert sample test cases for Coding benchmark
INSERT INTO test_cases (benchmark_id, prompt, expected_output, evaluation_criteria, weight)
VALUES 
    (
        (SELECT id FROM benchmarks WHERE name = 'Coding' LIMIT 1),
        'Write a function in Python that returns the Fibonacci sequence up to n terms.',
        NULL,
        '{"code_execution": true, "test_cases": [{"input": 5, "expected": [0, 1, 1, 2, 3]}, {"input": 10, "expected": [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]}]}',
        1.5
    ),
    (
        (SELECT id FROM benchmarks WHERE name = 'Coding' LIMIT 1),
        'Write a SQL query to find the top 5 customers who have spent the most money.',
        NULL,
        '{"code_analysis": true, "keywords": ["SELECT", "ORDER BY", "DESC", "LIMIT"]}',
        1.0
    );

-- Insert sample test cases for Summarization benchmark
INSERT INTO test_cases (benchmark_id, prompt, expected_output, evaluation_criteria, weight)
VALUES 
    (
        (SELECT id FROM benchmarks WHERE name = 'Summarization' LIMIT 1),
        'Summarize the following text in 2-3 sentences: "The effects of climate change are becoming increasingly evident worldwide. Rising global temperatures have led to more frequent and severe weather events, including hurricanes, floods, and droughts. Melting ice caps and glaciers are causing sea levels to rise, threatening coastal communities. Additionally, ecosystems are being disrupted, leading to biodiversity loss and shifts in plant and animal ranges. The scientific consensus is that human activities, particularly the burning of fossil fuels and deforestation, are the primary drivers of these changes."',
        NULL,
        '{"max_length": 100, "semantic_similarity": true}',
        1.0
    );

-- Insert sample test cases for Translation benchmark
INSERT INTO test_cases (benchmark_id, prompt, expected_output, evaluation_criteria, weight)
VALUES 
    (
        (SELECT id FROM benchmarks WHERE name = 'Translation' LIMIT 1),
        'Translate the following English text to French: "The quick brown fox jumps over the lazy dog."',
        'Le rapide renard brun saute par-dessus le chien paresseux.',
        '{"semantic_similarity": true, "language": "french"}',
        1.0
    ),
    (
        (SELECT id FROM benchmarks WHERE name = 'Translation' LIMIT 1),
        'Translate the following English text to Spanish: "I would like to order a coffee, please."',
        'Me gustaría pedir un café, por favor.',
        '{"semantic_similarity": true, "language": "spanish"}',
        1.0
    );

-- Insert some OpenRouter models
INSERT INTO models (name, provider, version, description, context_length)
VALUES 
    ('claude-3-opus-20240229', 'anthropic', '20240229', 'Anthropic''s most powerful model for highly complex tasks', 200000),
    ('claude-3-sonnet-20240229', 'anthropic', '20240229', 'Anthropic''s balanced model for enterprise workloads', 200000),
    ('claude-3-haiku-20240307', 'anthropic', '20240307', 'Anthropic''s fastest and most compact model', 200000),
    ('gpt-4o', 'openai', '20240313', 'OpenAI''s most advanced model with vision capabilities', 128000),
    ('gpt-4-turbo', 'openai', '20240213', 'OpenAI''s most capable model for complex tasks', 128000),
    ('gpt-3.5-turbo', 'openai', '20240307', 'OpenAI''s fast and efficient model', 16385),
    ('gemini-1.5-pro', 'google', '20240403', 'Google''s most capable model for complex tasks', 1000000),
    ('gemini-1.5-flash', 'google', '20240403', 'Google''s fast and efficient model', 1000000),
    ('llama-3-70b-instruct', 'meta', '20240403', 'Meta''s most capable open model', 8192),
    ('llama-3-8b-instruct', 'meta', '20240403', 'Meta''s efficient open model', 8192); 
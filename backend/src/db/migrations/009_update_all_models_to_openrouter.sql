-- Update all models to use openrouter as provider
UPDATE models
SET provider = 'openrouter';

-- Update model names to match OpenRouter's format where needed
UPDATE models
SET name = CASE
    WHEN name = 'claude-3.7-sonnet' THEN 'claude-3-sonnet-20240229'
    WHEN name = 'claude-3.5-sonnet' THEN 'claude-3-sonnet-20240229'
    WHEN name = 'claude-3.7-sonnet:thinking' THEN 'claude-3-sonnet-20240229'
    WHEN name = 'deepseek-chat' THEN 'deepseek-coder-33b'
    WHEN name = 'deepseek-r1' THEN 'deepseek-coder-33b'
    WHEN name = 'gemini-1.5-flash' THEN 'gemini-pro'
    WHEN name = 'gemini-1.5-pro' THEN 'gemini-pro'
    WHEN name = 'gemini-2.0-flash-001' THEN 'gemini-pro'
    WHEN name = 'llama-3-70b-instruct' THEN 'meta-llama/llama-2-70b-chat'
    WHEN name = 'llama-3-8b-instruct' THEN 'meta-llama/llama-2-70b-chat'
    ELSE name
END; 
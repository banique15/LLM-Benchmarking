-- Update all model providers to use openrouter
UPDATE models
SET provider = 'openrouter'
WHERE provider = 'anthropic';

-- Update model names to match OpenRouter's format
UPDATE models
SET name = CASE
    WHEN name = 'claude-3.7-sonnet' THEN 'claude-3-sonnet-20240229'
    WHEN name = 'claude-3-haiku-20240307' THEN 'claude-3-haiku-20240307'
    ELSE name
END
WHERE provider = 'openrouter'; 
-- Update model providers to use openrouter
UPDATE models 
SET provider = 'openrouter'
WHERE provider = 'anthropic'; 
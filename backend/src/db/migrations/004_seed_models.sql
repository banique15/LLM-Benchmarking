-- Insert some default models
INSERT INTO models (name, provider, version, description, parameters)
VALUES 
  ('gpt-3.5-turbo', 'openrouter', '0', 'GPT-3.5 Turbo via OpenRouter', '{"max_tokens": 1000, "temperature": 0.7}'),
  ('gpt-4', 'openrouter', '0', 'GPT-4 via OpenRouter', '{"max_tokens": 1000, "temperature": 0.7}'),
  ('claude-2', 'openrouter', '0', 'Claude 2 via OpenRouter', '{"max_tokens": 1000, "temperature": 0.7}'),
  ('claude-instant-1', 'openrouter', '0', 'Claude Instant via OpenRouter', '{"max_tokens": 1000, "temperature": 0.7}'),
  ('palm-2', 'openrouter', '0', 'PaLM 2 via OpenRouter', '{"max_tokens": 1000, "temperature": 0.7}')
ON CONFLICT (provider, name, version) DO NOTHING; 
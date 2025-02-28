-- First, delete existing models
DELETE FROM models;

-- Insert models with correct OpenRouter configuration
INSERT INTO models (name, provider, version, description, parameters)
VALUES 
  ('gpt-3.5-turbo', 'openrouter', '0', 'GPT-3.5 Turbo via OpenRouter', '{"max_tokens": 1000, "temperature": 0.7}'),
  ('gpt-4', 'openrouter', '0', 'GPT-4 via OpenRouter', '{"max_tokens": 1000, "temperature": 0.7}'),
  ('claude-3-opus-20240229', 'openrouter', '0', 'Claude 3 Opus via OpenRouter', '{"max_tokens": 1000, "temperature": 0.7}'),
  ('claude-3-sonnet-20240229', 'openrouter', '0', 'Claude 3 Sonnet via OpenRouter', '{"max_tokens": 1000, "temperature": 0.7}'),
  ('claude-3-haiku-20240307', 'openrouter', '0', 'Claude 3 Haiku via OpenRouter', '{"max_tokens": 1000, "temperature": 0.7}'),
  ('deepseek-chat', 'openrouter', '0', 'DeepSeek Chat via OpenRouter', '{"max_tokens": 1000, "temperature": 0.7}'),
  ('mixtral-8x7b-instruct', 'openrouter', '0', 'Mixtral 8x7B Instruct via OpenRouter', '{"max_tokens": 1000, "temperature": 0.7}'),
  ('palm-2', 'openrouter', '0', 'PaLM 2 via OpenRouter', '{"max_tokens": 1000, "temperature": 0.7}'); 
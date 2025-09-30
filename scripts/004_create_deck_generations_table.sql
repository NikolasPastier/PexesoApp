-- Create deck_generations table to track AI deck generation activity
CREATE TABLE IF NOT EXISTS deck_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on user_id and generated_at for efficient querying
CREATE INDEX IF NOT EXISTS idx_deck_generations_user_id_generated_at 
ON deck_generations(user_id, generated_at DESC);

-- Add comment to table
COMMENT ON TABLE deck_generations IS 'Tracks AI deck generation activity for rate limiting';

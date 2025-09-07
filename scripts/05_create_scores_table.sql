-- Create scores table for storing game results
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pairs_matched INTEGER NOT NULL DEFAULT 0,
  mistakes INTEGER NOT NULL DEFAULT 0,
  time_taken INTEGER NOT NULL DEFAULT 0, -- seconds
  level_reached INTEGER, -- only for survival mode
  xp_earned INTEGER NOT NULL DEFAULT 0,
  final_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scores_game_id ON scores(game_id);
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_final_score ON scores(final_score);
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at);

-- Enable Row Level Security
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Create policies for scores table
CREATE POLICY "Users can view their own scores" ON scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view scores from games they participated in" ON scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = scores.game_id 
      AND auth.uid()::text = ANY(SELECT jsonb_array_elements_text(games.players))
    )
  );

CREATE POLICY "Users can insert their own scores" ON scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create moves table for storing individual card flips
CREATE TABLE IF NOT EXISTS moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_moves_game_id ON moves(game_id);
CREATE INDEX IF NOT EXISTS idx_moves_player_id ON moves(player_id);
CREATE INDEX IF NOT EXISTS idx_moves_created_at ON moves(created_at);

-- Enable Row Level Security
ALTER TABLE moves ENABLE ROW LEVEL SECURITY;

-- Create policies for moves table
CREATE POLICY "Users can view moves from their games" ON moves
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = moves.game_id 
      AND auth.uid()::text = ANY(SELECT jsonb_array_elements_text(games.players))
    )
  );

CREATE POLICY "Users can insert their own moves" ON moves
  FOR INSERT WITH CHECK (auth.uid() = player_id);

-- Create games table for storing game sessions
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('normal', 'hard', 'extreme', 'speed', 'survival', 'custom')),
  rules JSONB, -- Custom rules, timers, lives
  players JSONB NOT NULL, -- Array of user_ids
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
  winner_id UUID REFERENCES users(id),
  score_summary JSONB, -- { userId: score }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_deck_id ON games(deck_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at);
CREATE INDEX IF NOT EXISTS idx_games_winner_id ON games(winner_id);

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create policies for games table
CREATE POLICY "Users can view games they participate in" ON games
  FOR SELECT USING (
    auth.uid()::text = ANY(SELECT jsonb_array_elements_text(players))
  );

CREATE POLICY "Users can create games" ON games
  FOR INSERT WITH CHECK (
    auth.uid()::text = ANY(SELECT jsonb_array_elements_text(players))
  );

CREATE POLICY "Users can update games they participate in" ON games
  FOR UPDATE USING (
    auth.uid()::text = ANY(SELECT jsonb_array_elements_text(players))
  );

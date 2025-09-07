-- Create achievements table (optional for MVP)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_earned_at ON achievements(earned_at);

-- Enable Row Level Security
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for achievements table
CREATE POLICY "Users can view their own achievements" ON achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements" ON achievements
  FOR INSERT WITH CHECK (true); -- Allow system to award achievements

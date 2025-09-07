-- Create decks table for storing card deck information
CREATE TABLE IF NOT EXISTS decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  images JSONB NOT NULL, -- Array of image URLs
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_decks_user_id ON decks(user_id);
CREATE INDEX IF NOT EXISTS idx_decks_is_public ON decks(is_public);
CREATE INDEX IF NOT EXISTS idx_decks_created_at ON decks(created_at);

-- Enable Row Level Security
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

-- Create policies for decks table
CREATE POLICY "Users can view public decks" ON decks
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own decks" ON decks
  FOR ALL USING (auth.uid() = user_id);

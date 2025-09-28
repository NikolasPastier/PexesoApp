-- Add plays_count column to decks table
ALTER TABLE decks ADD COLUMN IF NOT EXISTS plays_count INTEGER DEFAULT 0;

-- Create index for sorting by plays_count
CREATE INDEX IF NOT EXISTS idx_decks_plays_count ON decks(plays_count DESC);

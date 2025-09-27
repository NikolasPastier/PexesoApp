-- Add description field to decks table
ALTER TABLE decks ADD COLUMN IF NOT EXISTS description TEXT;

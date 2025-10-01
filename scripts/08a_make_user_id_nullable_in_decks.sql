-- Make user_id nullable in decks table to support system-owned default decks
-- This allows decks with user_id = NULL to represent official/system decks

ALTER TABLE decks 
ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policy to allow viewing system decks (user_id IS NULL)
DROP POLICY IF EXISTS "Users can view public decks" ON decks;

CREATE POLICY "Users can view public decks" ON decks
  FOR SELECT USING (is_public = true OR auth.uid() = user_id OR user_id IS NULL);

-- System decks (user_id IS NULL) should not be deletable by regular users
-- Only authenticated users can manage their own decks
DROP POLICY IF EXISTS "Users can manage their own decks" ON decks;

CREATE POLICY "Users can manage their own decks" ON decks
  FOR ALL USING (auth.uid() = user_id AND user_id IS NOT NULL);

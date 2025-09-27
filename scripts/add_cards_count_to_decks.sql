-- Add cards_count column to decks table
-- This migration adds a new column to store the number of cards in each deck

ALTER TABLE public.decks 
ADD COLUMN IF NOT EXISTS cards_count INTEGER DEFAULT 24;

-- Update existing decks to have a default cards_count based on their images array length
-- Assuming each image creates 2 cards (pairs), so cards_count = images_length * 2
UPDATE public.decks 
SET cards_count = CASE 
  WHEN jsonb_array_length(images) IS NOT NULL THEN jsonb_array_length(images) * 2
  ELSE 24
END
WHERE cards_count IS NULL OR cards_count = 24;

-- Add a check constraint to ensure cards_count is one of the valid values
ALTER TABLE public.decks 
ADD CONSTRAINT check_cards_count 
CHECK (cards_count IN (16, 24, 32));

-- Add a comment to document the column
COMMENT ON COLUMN public.decks.cards_count IS 'Total number of cards in the deck (16, 24, or 32)';

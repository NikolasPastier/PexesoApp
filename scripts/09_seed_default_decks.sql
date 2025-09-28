-- Seed default decks into the database
-- This makes all decks (default, public, private, AI) live in the same table

INSERT INTO decks (id, user_id, title, images, cards_count, is_public, plays_count, created_at)
VALUES 
  (
    gen_random_uuid(),
    null,
    'Classic Animals',
    '["/cute-cat.png", "/happy-golden-retriever.png", "/majestic-african-elephant.png", "/lion.jpg", "/solitary-penguin.png", "/butterfly.png", "/fluffy-brown-rabbit.png", "/majestic-owl.png"]',
    16,
    true,
    1247,
    now()
  ),
  (
    gen_random_uuid(),
    null,
    'Space Adventure',
    '["/rocket-ship.jpg", "/planet-earth.png", "/astronaut-contemplating.png", "/full-moon-night.png", "/night-sky-stars.png", "/earth-orbiting-satellite.png", "/otherworldly-visitor.png", "/futuristic-space-station.png"]',
    16,
    true,
    892,
    now()
  ),
  (
    gen_random_uuid(),
    null,
    'Ocean Life',
    '["/playful-dolphin.png", "/whimsical-seahorse.png", "/starfish.jpg", "/majestic-whale.png", "/octopus.jpg", "/vibrant-coral-reef.png", "/serene-sea-turtle.png", "/glowing-jellyfish.png"]',
    16,
    true,
    634,
    now()
  );

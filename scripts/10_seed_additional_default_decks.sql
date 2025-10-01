-- Add default decks for 24 and 32 card counts
-- This ensures users have deck options for all supported card counts

INSERT INTO decks (id, user_id, title, images, cards_count, is_public, plays_count, created_at)
VALUES 
  -- 24-card decks (12 pairs)
  (
    gen_random_uuid(),
    null,
    'Classic Animals Extended',
    '["/cute-cat.png", "/happy-golden-retriever.png", "/majestic-african-elephant.png", "/lion.jpg", "/solitary-penguin.png", "/butterfly.png", "/fluffy-brown-rabbit.png", "/majestic-owl.png", "/playful-dolphin.png", "/whimsical-seahorse.png", "/starfish.jpg", "/majestic-whale.png"]',
    24,
    true,
    856,
    now()
  ),
  (
    gen_random_uuid(),
    null,
    'Space Adventure Extended',
    '["/rocket-ship.jpg", "/planet-earth.png", "/astronaut-contemplating.png", "/full-moon-night.png", "/night-sky-stars.png", "/earth-orbiting-satellite.png", "/otherworldly-visitor.png", "/futuristic-space-station.png", "/vibrant-coral-reef.png", "/serene-sea-turtle.png", "/glowing-jellyfish.png", "/octopus.jpg"]',
    24,
    true,
    723,
    now()
  ),
  (
    gen_random_uuid(),
    null,
    'Ocean Life Extended',
    '["/playful-dolphin.png", "/whimsical-seahorse.png", "/starfish.jpg", "/majestic-whale.png", "/octopus.jpg", "/vibrant-coral-reef.png", "/serene-sea-turtle.png", "/glowing-jellyfish.png", "/cute-cat.png", "/happy-golden-retriever.png", "/majestic-african-elephant.png", "/lion.jpg"]',
    24,
    true,
    612,
    now()
  ),
  
  -- 32-card decks (16 pairs)
  (
    gen_random_uuid(),
    null,
    'Ultimate Animals Collection',
    '["/cute-cat.png", "/happy-golden-retriever.png", "/majestic-african-elephant.png", "/lion.jpg", "/solitary-penguin.png", "/butterfly.png", "/fluffy-brown-rabbit.png", "/majestic-owl.png", "/playful-dolphin.png", "/whimsical-seahorse.png", "/starfish.jpg", "/majestic-whale.png", "/octopus.jpg", "/vibrant-coral-reef.png", "/serene-sea-turtle.png", "/glowing-jellyfish.png"]',
    32,
    true,
    445,
    now()
  ),
  (
    gen_random_uuid(),
    null,
    'Ultimate Space Collection',
    '["/rocket-ship.jpg", "/planet-earth.png", "/astronaut-contemplating.png", "/full-moon-night.png", "/night-sky-stars.png", "/earth-orbiting-satellite.png", "/otherworldly-visitor.png", "/futuristic-space-station.png", "/cute-cat.png", "/happy-golden-retriever.png", "/majestic-african-elephant.png", "/lion.jpg", "/playful-dolphin.png", "/whimsical-seahorse.png", "/starfish.jpg", "/majestic-whale.png"]',
    32,
    true,
    387,
    now()
  ),
  (
    gen_random_uuid(),
    null,
    'Ultimate Ocean Collection',
    '["/playful-dolphin.png", "/whimsical-seahorse.png", "/starfish.jpg", "/majestic-whale.png", "/octopus.jpg", "/vibrant-coral-reef.png", "/serene-sea-turtle.png", "/glowing-jellyfish.png", "/rocket-ship.jpg", "/planet-earth.png", "/astronaut-contemplating.png", "/full-moon-night.png", "/night-sky-stars.png", "/earth-orbiting-satellite.png", "/otherworldly-visitor.png", "/futuristic-space-station.png"]',
    32,
    true,
    298,
    now()
  );

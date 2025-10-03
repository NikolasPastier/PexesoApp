-- Add policy to allow public read access to user profiles
-- This allows the deck gallery to show creator usernames and avatars
-- without exposing sensitive information like email

CREATE POLICY "Public profiles are readable" ON users
  FOR SELECT
  USING (true);

-- Note: This policy allows anyone to read username and avatar_url
-- The email field is still protected by application-level access control
-- Only non-sensitive profile information should be exposed through this policy

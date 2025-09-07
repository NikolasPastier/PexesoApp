-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user XP and rank
CREATE OR REPLACE FUNCTION public.update_user_xp(user_uuid UUID, xp_to_add INTEGER)
RETURNS VOID AS $$
DECLARE
  new_xp INTEGER;
  new_rank TEXT;
BEGIN
  -- Update XP
  UPDATE users 
  SET xp = xp + xp_to_add 
  WHERE id = user_uuid
  RETURNING xp INTO new_xp;
  
  -- Determine new rank based on XP
  IF new_xp >= 10000 THEN
    new_rank := 'Master';
  ELSIF new_xp >= 5000 THEN
    new_rank := 'Expert';
  ELSIF new_xp >= 2000 THEN
    new_rank := 'Advanced';
  ELSIF new_xp >= 500 THEN
    new_rank := 'Intermediate';
  ELSE
    new_rank := 'Beginner';
  END IF;
  
  -- Update rank
  UPDATE users 
  SET rank = new_rank 
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

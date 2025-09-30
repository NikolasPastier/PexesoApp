-- Add subscription-related fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
ADD COLUMN IF NOT EXISTS monthly_generations_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for faster plan lookups
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);

-- Create index for faster reset checks
CREATE INDEX IF NOT EXISTS idx_users_last_reset ON users(last_reset);

-- Add email and photo_url to users table
ALTER TABLE public.users
ADD COLUMN email TEXT,
ADD COLUMN photo_url TEXT;

-- For existing teachers/parents/admins, they might not have emails in public.users yet,
-- but future ones will.

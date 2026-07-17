-- Truncate existing students to allow schema changes cleanly
TRUNCATE TABLE students CASCADE;

-- Add new columns
ALTER TABLE students 
ADD COLUMN date_of_birth DATE,
ADD COLUMN gender TEXT CHECK (gender IN ('L', 'P')),
ADD COLUMN profile_picture TEXT;

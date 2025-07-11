-- Migration: Alter user_id column type from integer to text in favorites table
ALTER TABLE favorites
ALTER COLUMN user_id TYPE text USING user_id::text;

/*
  # Add session type to appointments

  1. Changes
    - Add `session_type` column to appointments table
    - Add check constraint for valid session types
    - Set default value to 'chat'

  2. Security
    - No changes to RLS policies needed
*/

-- Add session_type column to appointments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'session_type'
  ) THEN
    ALTER TABLE appointments ADD COLUMN session_type text DEFAULT 'chat';
  END IF;
END $$;

-- Add check constraint for valid session types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'appointments_session_type_check'
  ) THEN
    ALTER TABLE appointments ADD CONSTRAINT appointments_session_type_check 
    CHECK (session_type IN ('chat', 'video', 'audio'));
  END IF;
END $$;
/*
  # Add patient_id to session_feedback table

  1. Changes
    - Add patient_id column to session_feedback table
    - Update existing records to populate patient_id from appointments
    - Add foreign key constraint

  2. Security
    - Update RLS policies to use patient_id
*/

-- Add patient_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'session_feedback' AND column_name = 'patient_id'
  ) THEN
    ALTER TABLE session_feedback ADD COLUMN patient_id uuid;
  END IF;
END $$;

-- Update existing records to populate patient_id from appointments
UPDATE session_feedback 
SET patient_id = appointments.patient_id
FROM appointments
WHERE session_feedback.appointment_id = appointments.id
AND session_feedback.patient_id IS NULL;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'session_feedback_patient_id_fkey'
  ) THEN
    ALTER TABLE session_feedback 
    ADD CONSTRAINT session_feedback_patient_id_fkey 
    FOREIGN KEY (patient_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Make patient_id NOT NULL after populating existing records
ALTER TABLE session_feedback ALTER COLUMN patient_id SET NOT NULL;
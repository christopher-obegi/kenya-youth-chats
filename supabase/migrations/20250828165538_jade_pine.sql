/*
  # Create session feedback table

  1. New Tables
    - `session_feedback`
      - `id` (uuid, primary key)
      - `appointment_id` (uuid, foreign key to appointments)
      - `therapist_id` (uuid, foreign key to profiles)
      - `patient_id` (uuid, foreign key to profiles)
      - `rating` (integer, 1-5 scale)
      - `feedback` (text, optional feedback comments)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `session_feedback` table
    - Add policies for patients to create feedback and therapists to read their feedback
*/

CREATE TABLE IF NOT EXISTS session_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  therapist_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE session_feedback ENABLE ROW LEVEL SECURITY;

-- Patients can create feedback for their own sessions
CREATE POLICY "Patients can create session feedback"
  ON session_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

-- Patients can read their own feedback
CREATE POLICY "Patients can read own feedback"
  ON session_feedback
  FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

-- Therapists can read feedback about their sessions
CREATE POLICY "Therapists can read their feedback"
  ON session_feedback
  FOR SELECT
  TO authenticated
  USING (therapist_id = auth.uid());

-- Admins can read all feedback
CREATE POLICY "Admins can read all feedback"
  ON session_feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_session_feedback_therapist_id ON session_feedback(therapist_id);
CREATE INDEX IF NOT EXISTS idx_session_feedback_appointment_id ON session_feedback(appointment_id);
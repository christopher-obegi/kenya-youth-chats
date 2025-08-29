-- Create session_feedback table
CREATE TABLE public.session_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on session_feedback
ALTER TABLE public.session_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for session_feedback
CREATE POLICY "Users can view their own session feedback" 
ON public.session_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own session feedback" 
ON public.session_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own session feedback" 
ON public.session_feedback 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add education column to therapists table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'therapists' AND column_name = 'education') THEN
        ALTER TABLE public.therapists ADD COLUMN education TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_session_feedback_appointment_id ON public.session_feedback(appointment_id);
CREATE INDEX IF NOT EXISTS idx_session_feedback_user_id ON public.session_feedback(user_id);
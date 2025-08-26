-- Create storage bucket for therapist documents
INSERT INTO storage.buckets (id, name, public) VALUES ('therapist-documents', 'therapist-documents', false);

-- Create policies for therapist document uploads
CREATE POLICY "Therapists can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'therapist-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Therapists can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'therapist-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all therapist documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'therapist-documents' AND EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

-- Add documents column to therapists table for storing document references
ALTER TABLE therapists 
ADD COLUMN documents JSONB DEFAULT '[]'::jsonb;

-- Create admin role in profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'admin') THEN
    -- This is just a placeholder - in real implementation, you'd create admin users properly
    INSERT INTO profiles (id, email, first_name, last_name, role) 
    VALUES (gen_random_uuid(), 'admin@mindfulkenya.com', 'Admin', 'User', 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
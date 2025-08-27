import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TherapistRegistrationData {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  
  // Professional Info
  licenseNumber: string;
  education: string;
  specializations: string[];
  languages: string[];
  
  // Experience & Availability
  yearsExperience: number;
  bio: string;
  location: string;
  hourlyRate: number;
  certifications: string[];
  
  // Documents
  documents?: any[];
}

const initialFormData: TherapistRegistrationData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  licenseNumber: "",
  education: "",
  specializations: [],
  languages: ["English"],
  yearsExperience: 0,
  bio: "",
  location: "",
  hourlyRate: 0,
  certifications: [],
  documents: [],
};

export function useTherapistRegistration() {
  const [formData, setFormData] = useState<TherapistRegistrationData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<TherapistRegistrationData>>({});
  const { toast } = useToast();

  const updateFormData = (updates: Partial<TherapistRegistrationData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(updates).forEach(key => {
        delete newErrors[key as keyof TherapistRegistrationData];
      });
      return newErrors;
    });
  };

  const validateStep = async (step: number): Promise<boolean> => {
    const newErrors: Partial<TherapistRegistrationData> = {};

    switch (step) {
      case 1: // Basic Info
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
        if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
        if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
        break;

      case 2: // Professional Info
        if (!formData.licenseNumber.trim()) newErrors.licenseNumber = "License number is required";
        if (!formData.education.trim()) newErrors.education = "Education is required";
        if (formData.specializations.length === 0) newErrors.specializations = ["At least one specialization is required"];
        break;

      case 3: // Experience
        if (formData.yearsExperience < 0) newErrors.yearsExperience = "Years of experience must be non-negative" as any;
        if (!formData.bio.trim()) newErrors.bio = "Bio is required";
        if (formData.bio.length < 100) newErrors.bio = "Bio must be at least 100 characters";
        if (!formData.location.trim()) newErrors.location = "Location is required";
        if (formData.hourlyRate <= 0) newErrors.hourlyRate = "Hourly rate must be greater than 0" as any;
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitApplication = async () => {
    setIsSubmitting(true);
    
    try {
      // First, create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: Math.random().toString(36).slice(-12), // Temporary password
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: 'therapist'
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) {
        console.error("Auth error:", authError);
        toast({
          title: "Error",
          description: authError.message,
          variant: "destructive"
        });
        return;
      }

      if (!authData.user) {
        toast({
          title: "Error",
          description: "Failed to create user account",
          variant: "destructive"
        });
        return;
      }

      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the profile with additional information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: formData.phone,
          date_of_birth: formData.dateOfBirth,
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        // Don't fail here - the profile should have been created by the trigger
        console.log("Continuing despite profile update error...");
      }

      // Create therapist profile with proper data types
      const therapistData = {
        user_id: authData.user.id,
        license_number: formData.licenseNumber.trim(),
        years_experience: Number(formData.yearsExperience) || 0,
        bio: formData.bio.trim(),
        specialization: formData.specializations.length > 0 ? formData.specializations : ['General'],
        hourly_rate: Number(formData.hourlyRate) || 0,
        location: formData.location.trim(),
        education: formData.education.trim(),
        certifications: formData.certifications || [],
        languages: formData.languages.length > 0 ? formData.languages : ['English'],
        documents: formData.documents || [],
        is_verified: false,
        is_available: false // Initially not available until verified
      };

      console.log("Inserting therapist data:", therapistData);

      const { error: therapistError } = await supabase
        .from('therapists')
        .insert(therapistData);

      if (therapistError) {
        console.error("Therapist creation error:", therapistError);
        toast({
          title: "Error",
          description: `Failed to create therapist profile: ${therapistError.message}`,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success!",
        description: "Your application has been submitted successfully",
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    updateFormData,
    submitApplication,
    isSubmitting,
    isSubmitted,
    errors,
    validateStep
  };
}
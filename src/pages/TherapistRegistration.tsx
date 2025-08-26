import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Heart, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { BasicInfoStep } from "@/components/therapist-registration/BasicInfoStep";
import { ProfessionalInfoStep } from "@/components/therapist-registration/ProfessionalInfoStep";
import { ExperienceStep } from "@/components/therapist-registration/ExperienceStep";
import DocumentUploadStep from "@/components/therapist-registration/DocumentUploadStep";
import { ReviewStep } from "@/components/therapist-registration/ReviewStep";
import { useTherapistRegistration } from "@/hooks/useTherapistRegistration";

const steps = [
  { id: 1, title: "Basic Information", description: "Tell us about yourself" },
  { id: 2, title: "Professional Details", description: "Your credentials and specializations" },
  { id: 3, title: "Experience & Availability", description: "Your background and preferences" },
  { id: 4, title: "Document Upload", description: "Upload verification documents" },
  { id: 5, title: "Review & Submit", description: "Confirm your information" },
];

export default function TherapistRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [documents, setDocuments] = useState<any[]>([]);
  const {
    formData,
    updateFormData,
    submitApplication,
    isSubmitting,
    isSubmitted,
    errors,
    validateStep
  } = useTherapistRegistration();

  const handleNext = async () => {
    // Skip validation for document upload step
    if (currentStep !== 4) {
      const isValid = await validateStep(currentStep);
      if (!isValid) return;
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Update form data with documents before submitting
    updateFormData({ documents });
    await submitApplication();
  };

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card bg-white/95 backdrop-blur-sm border-0 text-center">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-accent" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for applying to join MindfulKenya. We'll review your application and get back to you within 3-5 business days.
            </p>
            <Link to="/">
              <Button variant="cta" className="w-full">
                Return to Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl text-white mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Heart className="h-6 w-6" />
            </div>
            MindfulKenya
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Join Our Team of Therapists</h1>
          <p className="text-white/80">Help young Kenyans on their mental health journey</p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step.id 
                    ? 'bg-white text-primary' 
                    : 'bg-white/20 text-white/60'
                  }
                `}>
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-16 h-1 mx-2
                    ${currentStep > step.id ? 'bg-white' : 'bg-white/20'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Card */}
        <Card className="max-w-2xl mx-auto shadow-card bg-white/95 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="text-2xl">{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step Content */}
            {currentStep === 1 && (
              <BasicInfoStep 
                data={formData} 
                onChange={updateFormData} 
                errors={errors}
              />
            )}
            {currentStep === 2 && (
              <ProfessionalInfoStep 
                data={formData} 
                onChange={updateFormData} 
                errors={errors}
              />
            )}
            {currentStep === 3 && (
              <ExperienceStep 
                data={formData} 
                onChange={updateFormData} 
                errors={errors}
              />
            )}
            {currentStep === 4 && (
              <DocumentUploadStep 
                isSubmitting={isSubmitting}
                onDocumentsChange={setDocuments}
              />
            )}
            {currentStep === 5 && (
              <ReviewStep data={{ ...formData, documents }} />
            )}

            {/* Navigation */}
            {currentStep !== 4 && (
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentStep < steps.length ? (
                  <Button onClick={handleNext} variant="cta">
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit} 
                    variant="cta"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
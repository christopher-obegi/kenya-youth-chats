import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Calendar, Award, GraduationCap, MapPin, DollarSign, Clock, Languages } from "lucide-react";
import type { TherapistRegistrationData } from "@/hooks/useTherapistRegistration";

interface ReviewStepProps {
  data: TherapistRegistrationData;
}

export function ReviewStep({ data }: ReviewStepProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center pb-4">
        <h3 className="text-lg font-semibold">Review Your Application</h3>
        <p className="text-sm text-muted-foreground">
          Please review all information carefully before submitting
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Full Name</p>
              <p className="text-sm text-muted-foreground">{data.firstName} {data.lastName}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Date of Birth</p>
              <p className="text-sm text-muted-foreground">{formatDate(data.dateOfBirth)}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{data.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{data.phone}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5" />
            Professional Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">License Number</p>
            <p className="text-sm text-muted-foreground">{data.licenseNumber}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Education & Qualifications</p>
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm">{data.education}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Specializations</p>
            <div className="flex flex-wrap gap-2">
              {data.specializations.map((spec) => (
                <Badge key={spec} variant="secondary">{spec}</Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Languages</p>
            <div className="flex flex-wrap gap-2">
              {data.languages.map((lang) => (
                <Badge key={lang} variant="outline" className="flex items-center gap-1">
                  <Languages className="h-3 w-3" />
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience & Practice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Experience & Practice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Experience</p>
                <p className="text-sm text-muted-foreground">{data.yearsExperience} years</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{data.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Hourly Rate</p>
                <p className="text-sm text-muted-foreground">KES {data.hourlyRate.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Professional Bio</p>
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm whitespace-pre-wrap">{data.bio}</p>
            </div>
          </div>

          {data.certifications.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Additional Certifications</p>
              <div className="flex flex-wrap gap-2">
                {data.certifications.map((cert) => (
                  <Badge key={cert} variant="outline" className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="bg-accent/10 p-4 rounded-lg">
        <h4 className="font-medium mb-2">What happens next?</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Your application will be reviewed by our team within 3-5 business days</li>
          <li>• We'll verify your credentials and professional background</li>
          <li>• You'll receive an email with the next steps once approved</li>
          <li>• Approved therapists can start accepting clients immediately</li>
        </ul>
      </div>
    </div>
  );
}
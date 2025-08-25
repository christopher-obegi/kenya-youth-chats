import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Award, Plus, X, Clock } from "lucide-react";
import { useState } from "react";
import type { TherapistRegistrationData } from "@/hooks/useTherapistRegistration";

interface ExperienceStepProps {
  data: TherapistRegistrationData;
  onChange: (updates: Partial<TherapistRegistrationData>) => void;
  errors: Partial<TherapistRegistrationData>;
}

const commonCertifications = [
  "Cognitive Behavioral Therapy (CBT)",
  "Dialectical Behavior Therapy (DBT)",
  "EMDR Therapy",
  "Family Systems Therapy",
  "Mindfulness-Based Stress Reduction",
  "Solution-Focused Brief Therapy",
  "Trauma-Informed Care",
  "Group Therapy Facilitation"
];

export function ExperienceStep({ data, onChange, errors }: ExperienceStepProps) {
  const [newCertification, setNewCertification] = useState("");

  const addCertification = (cert: string) => {
    if (cert && !data.certifications.includes(cert)) {
      onChange({ certifications: [...data.certifications, cert] });
    }
    setNewCertification("");
  };

  const removeCertification = (cert: string) => {
    onChange({ certifications: data.certifications.filter(c => c !== cert) });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="yearsExperience">Years of Experience *</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="yearsExperience"
              type="number"
              min="0"
              max="50"
              value={data.yearsExperience}
              onChange={(e) => onChange({ yearsExperience: parseInt(e.target.value) || 0 })}
              placeholder="5"
              className="pl-10"
              error={!!errors.yearsExperience}
            />
          </div>
          {errors.yearsExperience && (
            <p className="text-sm text-destructive">{errors.yearsExperience}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="hourlyRate">Hourly Rate (KES) *</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="hourlyRate"
              type="number"
              min="0"
              step="100"
              value={data.hourlyRate}
              onChange={(e) => onChange({ hourlyRate: parseInt(e.target.value) || 0 })}
              placeholder="2000"
              className="pl-10"
              error={!!errors.hourlyRate}
            />
          </div>
          {errors.hourlyRate && (
            <p className="text-sm text-destructive">{errors.hourlyRate}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Suggested range: KES 1,500 - 5,000 per hour
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location/City *</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="location"
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="Nairobi, Kenya"
            className="pl-10"
            error={!!errors.location}
          />
        </div>
        {errors.location && (
          <p className="text-sm text-destructive">{errors.location}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Professional Bio *</Label>
        <Textarea
          id="bio"
          value={data.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          placeholder="Tell us about your approach to therapy, your experience working with young people, and what makes you passionate about mental health care in Kenya..."
          className="min-h-[120px]"
          error={!!errors.bio}
        />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>{data.bio.length}/1000 characters</span>
          <span>Minimum 100 characters</span>
        </div>
        {errors.bio && (
          <p className="text-sm text-destructive">{errors.bio}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Additional Certifications</Label>
        <div className="space-y-3">
          {/* Current certifications */}
          {data.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.certifications.map((cert) => (
                <Badge key={cert} variant="secondary" className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {cert}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => removeCertification(cert)}
                  />
                </Badge>
              ))}
            </div>
          )}

          {/* Common certifications */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Common certifications:</p>
            <div className="flex flex-wrap gap-2">
              {commonCertifications
                .filter(cert => !data.certifications.includes(cert))
                .map((cert) => (
                  <Button
                    key={cert}
                    variant="outline"
                    size="sm"
                    onClick={() => addCertification(cert)}
                    className="h-8"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {cert}
                  </Button>
              ))}
            </div>
          </div>

          {/* Custom certification */}
          <div className="flex gap-2">
            <Input
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              placeholder="Add custom certification"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCertification(newCertification);
                }
              }}
            />
            <Button 
              type="button"
              onClick={() => addCertification(newCertification)}
              disabled={!newCertification}
            >
              Add
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Add any specialized training or certifications you have completed
        </p>
      </div>

      <div className="bg-accent/10 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          This information helps us match you with clients who would benefit most from your expertise and approach.
        </p>
      </div>
    </div>
  );
}
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Award, Languages, Plus, X } from "lucide-react";
import { useState } from "react";
import type { TherapistRegistrationData } from "@/hooks/useTherapistRegistration";

interface ProfessionalInfoStepProps {
  data: TherapistRegistrationData;
  onChange: (updates: Partial<TherapistRegistrationData>) => void;
  errors: Partial<TherapistRegistrationData>;
}

const commonSpecializations = [
  "Anxiety Disorders",
  "Depression",
  "Trauma & PTSD",
  "Relationship Counseling",
  "Family Therapy",
  "Adolescent Therapy",
  "Addiction Counseling",
  "Grief & Loss",
  "Career Counseling",
  "Stress Management"
];

const kenyanLanguages = [
  "English",
  "Swahili",
  "Kikuyu",
  "Luhya",
  "Luo",
  "Kalenjin",
  "Kamba",
  "Kisii",
  "Meru",
  "Mijikenda"
];

export function ProfessionalInfoStep({ data, onChange, errors }: ProfessionalInfoStepProps) {
  const [newSpecialization, setNewSpecialization] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  const addSpecialization = (spec: string) => {
    if (spec && !data.specializations.includes(spec)) {
      onChange({ specializations: [...data.specializations, spec] });
    }
    setNewSpecialization("");
  };

  const removeSpecialization = (spec: string) => {
    onChange({ specializations: data.specializations.filter(s => s !== spec) });
  };

  const addLanguage = (lang: string) => {
    if (lang && !data.languages.includes(lang)) {
      onChange({ languages: [...data.languages, lang] });
    }
    setNewLanguage("");
  };

  const removeLanguage = (lang: string) => {
    if (data.languages.length > 1) { // Keep at least one language
      onChange({ languages: data.languages.filter(l => l !== lang) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="licenseNumber">License Number *</Label>
        <div className="relative">
          <Award className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="licenseNumber"
            value={data.licenseNumber}
            onChange={(e) => onChange({ licenseNumber: e.target.value })}
            placeholder="KPA License Number"
            className="pl-10"
            error={!!errors.licenseNumber}
          />
        </div>
        {errors.licenseNumber && (
          <p className="text-sm text-destructive">{errors.licenseNumber}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Enter your Kenya Psychological Association (KPA) license number
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="education">Education & Qualifications *</Label>
        <div className="relative">
          <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Textarea
            id="education"
            value={data.education}
            onChange={(e) => onChange({ education: e.target.value })}
            placeholder="e.g., Masters in Clinical Psychology, University of Nairobi (2020)"
            className="pl-10 min-h-[100px]"
            error={!!errors.education}
          />
        </div>
        {errors.education && (
          <p className="text-sm text-destructive">{errors.education}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Specializations *</Label>
        <div className="space-y-3">
          {/* Current specializations */}
          <div className="flex flex-wrap gap-2">
            {data.specializations.map((spec) => (
              <Badge key={spec} variant="secondary" className="flex items-center gap-1">
                {spec}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => removeSpecialization(spec)}
                />
              </Badge>
            ))}
          </div>

          {/* Common specializations */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Common specializations:</p>
            <div className="flex flex-wrap gap-2">
              {commonSpecializations
                .filter(spec => !data.specializations.includes(spec))
                .map((spec) => (
                  <Button
                    key={spec}
                    variant="outline"
                    size="sm"
                    onClick={() => addSpecialization(spec)}
                    className="h-8"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {spec}
                  </Button>
              ))}
            </div>
          </div>

          {/* Custom specialization */}
          <div className="flex gap-2">
            <Input
              value={newSpecialization}
              onChange={(e) => setNewSpecialization(e.target.value)}
              placeholder="Add custom specialization"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSpecialization(newSpecialization);
                }
              }}
            />
            <Button 
              type="button"
              onClick={() => addSpecialization(newSpecialization)}
              disabled={!newSpecialization}
            >
              Add
            </Button>
          </div>
        </div>
        {errors.specializations && (
          <p className="text-sm text-destructive">{Array.isArray(errors.specializations) ? errors.specializations[0] : errors.specializations}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Languages Spoken *</Label>
        <div className="space-y-3">
          {/* Current languages */}
          <div className="flex flex-wrap gap-2">
            {data.languages.map((lang) => (
              <Badge key={lang} variant="secondary" className="flex items-center gap-1">
                <Languages className="h-3 w-3" />
                {lang}
                {data.languages.length > 1 && (
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => removeLanguage(lang)}
                  />
                )}
              </Badge>
            ))}
          </div>

          {/* Available languages */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Add languages:</p>
            <div className="flex flex-wrap gap-2">
              {kenyanLanguages
                .filter(lang => !data.languages.includes(lang))
                .map((lang) => (
                  <Button
                    key={lang}
                    variant="outline"
                    size="sm"
                    onClick={() => addLanguage(lang)}
                    className="h-8"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {lang}
                  </Button>
              ))}
            </div>
          </div>

          {/* Custom language */}
          <div className="flex gap-2">
            <Input
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Add other language"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLanguage(newLanguage);
                }
              }}
            />
            <Button 
              type="button"
              onClick={() => addLanguage(newLanguage)}
              disabled={!newLanguage}
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-accent/10 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Your professional credentials will be verified by our team before your profile goes live.
        </p>
      </div>
    </div>
  );
}
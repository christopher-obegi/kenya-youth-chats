import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Calendar } from "lucide-react";
import type { TherapistRegistrationData } from "@/hooks/useTherapistRegistration";

interface BasicInfoStepProps {
  data: TherapistRegistrationData;
  onChange: (updates: Partial<TherapistRegistrationData>) => void;
  errors: Partial<TherapistRegistrationData>;
}

export function BasicInfoStep({ data, onChange, errors }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="firstName"
              value={data.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              placeholder="Your first name"
              className="pl-10"
              error={!!errors.firstName}
            />
          </div>
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={data.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            placeholder="Your last name"
            error={!!errors.lastName}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="your@email.com"
            className="pl-10"
            error={!!errors.email}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+254 700 000 000"
            className="pl-10"
            error={!!errors.phone}
          />
        </div>
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="dateOfBirth"
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => onChange({ dateOfBirth: e.target.value })}
            className="pl-10"
            error={!!errors.dateOfBirth}
          />
        </div>
        {errors.dateOfBirth && (
          <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
        )}
      </div>

      <div className="bg-accent/10 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          * Required fields. This information will be used to create your professional profile and must be accurate.
        </p>
      </div>
    </div>
  );
}
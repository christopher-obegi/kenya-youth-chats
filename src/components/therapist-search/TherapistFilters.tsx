import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, X } from 'lucide-react';

export interface TherapistFilters {
  searchQuery: string;
  specializations: string[];
  languages: string[];
  gender: string;
  maxHourlyRate: number;
  location: string;
  availableNow: boolean;
}

interface TherapistFiltersProps {
  filters: TherapistFilters;
  onFiltersChange: (filters: TherapistFilters) => void;
  onClearFilters: () => void;
}

const SPECIALIZATIONS = [
  'Anxiety Disorders',
  'Depression',
  'Trauma & PTSD',
  'Relationship Counseling',
  'Family Therapy',
  'Teen & Youth Issues',
  'Addiction Recovery',
  'Grief & Loss',
  'Stress Management',
  'Self-Esteem Issues'
];

const LANGUAGES = ['English', 'Swahili', 'Kikuyu', 'Luo', 'Kalenjin', 'Kamba'];

export function TherapistFilters({ filters, onFiltersChange, onClearFilters }: TherapistFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = <K extends keyof TherapistFilters>(
    key: K,
    value: TherapistFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleSpecialization = (specialization: string) => {
    const newSpecializations = filters.specializations.includes(specialization)
      ? filters.specializations.filter(s => s !== specialization)
      : [...filters.specializations, specialization];
    updateFilter('specializations', newSpecializations);
  };

  const toggleLanguage = (language: string) => {
    const newLanguages = filters.languages.includes(language)
      ? filters.languages.filter(l => l !== language)
      : [...filters.languages, language];
    updateFilter('languages', newLanguages);
  };

  const hasActiveFilters = filters.searchQuery || 
    filters.specializations.length > 0 || 
    filters.languages.length > 0 || 
    filters.gender || 
    filters.location || 
    filters.maxHourlyRate < 10000 ||
    filters.availableNow;

  return (
    <Card className="bg-gradient-card shadow-card border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Find Your Perfect Therapist
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className={`space-y-6 ${!isExpanded ? 'hidden lg:block' : ''}`}>
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name, specialization..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City or area"
            value={filters.location}
            onChange={(e) => updateFilter('location', e.target.value)}
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label>Gender Preference</Label>
          <Select value={filters.gender} onValueChange={(value) => updateFilter('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any gender</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Max Hourly Rate */}
        <div className="space-y-3">
          <Label>Maximum Hourly Rate: KES {filters.maxHourlyRate}</Label>
          <Slider
            value={[filters.maxHourlyRate]}
            onValueChange={(value) => updateFilter('maxHourlyRate', value[0])}
            max={10000}
            min={1000}
            step={500}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>KES 1,000</span>
            <span>KES 10,000+</span>
          </div>
        </div>

        {/* Languages */}
        <div className="space-y-3">
          <Label>Languages</Label>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((language) => (
              <div key={language} className="flex items-center space-x-2">
                <Checkbox
                  id={`lang-${language}`}
                  checked={filters.languages.includes(language)}
                  onCheckedChange={() => toggleLanguage(language)}
                />
                <Label htmlFor={`lang-${language}`} className="text-sm">
                  {language}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Specializations */}
        <div className="space-y-3">
          <Label>Specializations</Label>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
            {SPECIALIZATIONS.map((specialization) => (
              <div key={specialization} className="flex items-center space-x-2">
                <Checkbox
                  id={`spec-${specialization}`}
                  checked={filters.specializations.includes(specialization)}
                  onCheckedChange={() => toggleSpecialization(specialization)}
                />
                <Label htmlFor={`spec-${specialization}`} className="text-sm">
                  {specialization}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Available Now */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="available-now"
            checked={filters.availableNow}
            onCheckedChange={(checked) => updateFilter('availableNow', !!checked)}
          />
          <Label htmlFor="available-now">Available for sessions now</Label>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Clock, Languages } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Therapist {
  id: string;
  user_id: string;
  bio: string;
  specialization: string[];
  hourly_rate: number;
  years_experience: number;
  languages: string[];
  location: string;
  is_verified: boolean;
  is_available: boolean;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export const TherapistGrid = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      const { data, error } = await supabase
        .from('therapists')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('is_verified', true)
        .eq('is_available', true)
        .limit(6);

      if (error) throw error;
      setTherapists(data || []);
    } catch (error) {
      console.error('Error fetching therapists:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Meet Our Therapists</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our verified mental health professionals are here to support you on your journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {therapists.map((therapist) => (
            <Card key={therapist.id} className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-0">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                    <AvatarImage src={therapist.profiles.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {therapist.profiles.first_name[0]}{therapist.profiles.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {therapist.profiles.first_name} {therapist.profiles.last_name}
                    </h3>
                    {therapist.is_verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified Therapist
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {therapist.bio}
                </p>

                <div className="flex flex-wrap gap-1">
                  {therapist.specialization.slice(0, 3).map((spec) => (
                    <Badge key={spec} variant="outline" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                  {therapist.specialization.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{therapist.specialization.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{therapist.years_experience}y exp</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{therapist.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Languages className="h-4 w-4" />
                    <span>{therapist.languages.join(', ')}</span>
                  </div>
                  <div className="font-semibold text-primary">
                    KSh {therapist.hourly_rate}/session
                  </div>
                </div>

                <Button className="w-full" variant="default">
                  Book Session
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {therapists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No therapists available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};
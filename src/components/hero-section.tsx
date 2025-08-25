import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Shield, Users } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Kenyan youth connecting through mental health support"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Mental Health Support
            <span className="block text-accent"> Tailored for Kenyan Youth</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Connect with qualified therapists who understand your culture, language, and experiences. 
            Your journey to better mental health starts here.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="lg" className="group">
              Find Your Therapist
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline-hero" size="lg">
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 mb-3">
                <Users className="h-8 w-8" />
              </div>
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm opacity-80">Verified Therapists</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 mb-3">
                <Shield className="h-8 w-8" />
              </div>
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm opacity-80">Secure & Private</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 mb-3">
                <Heart className="h-8 w-8" />
              </div>
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm opacity-80">Support Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-20 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-accent/20 rounded-full blur-xl animate-pulse delay-1000"></div>
    </section>
  );
};
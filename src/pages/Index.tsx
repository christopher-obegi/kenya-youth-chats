import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { TherapistGrid } from "@/components/therapist-grid";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TherapistGrid />
      </main>
    </div>
  );
};

export default Index;

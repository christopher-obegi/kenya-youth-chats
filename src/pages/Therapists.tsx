import { Navigation } from "@/components/navigation";
import { TherapistGrid } from "@/components/therapist-grid";

const Therapists = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Find Your Perfect Therapist
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Browse our network of verified, licensed mental health professionals. 
              Find someone who understands your needs and can help you on your journey to better mental health.
            </p>
          </div>
          <TherapistGrid />
        </div>
      </main>
    </div>
  );
};

export default Therapists;
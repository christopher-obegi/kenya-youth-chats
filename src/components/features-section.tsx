import { Card, CardContent } from "@/components/ui/card";
import { Shield, MessageCircle, Calendar, CreditCard, Users, Clock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "100% Secure & Private",
    description: "Your conversations are completely confidential with end-to-end encryption."
  },
  {
    icon: MessageCircle,
    title: "Chat in Your Language",
    description: "Connect with therapists who speak Swahili, English, and other local languages."
  },
  {
    icon: Calendar,
    title: "Flexible Scheduling",
    description: "Book sessions that fit your schedule, including evenings and weekends."
  },
  {
    icon: CreditCard,
    title: "M-Pesa Integration",
    description: "Pay securely using M-Pesa or other convenient payment methods."
  },
  {
    icon: Users,
    title: "Culturally Aware",
    description: "Our therapists understand Kenyan culture and youth-specific challenges."
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Access crisis support and resources whenever you need them most."
  }
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose MindfulKenya?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're committed to making mental health support accessible, affordable, and culturally relevant for every young Kenyan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-0"
            >
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
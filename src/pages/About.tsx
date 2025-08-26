import { Navigation } from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, Users, Clock } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "We believe in providing empathetic, non-judgmental support for everyone seeking mental health care."
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Your privacy is paramount. We maintain the highest standards of confidentiality and data security."
    },
    {
      icon: Users,
      title: "Cultural Sensitivity",
      description: "Our therapists understand the unique cultural context of Kenyan communities and mental health needs."
    },
    {
      icon: Clock,
      title: "Accessible Support",
      description: "Mental health support when you need it, with flexible scheduling and affordable options."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-6">
              About MindfulKenya
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              MindfulKenya is dedicated to making mental health support accessible, 
              affordable, and culturally sensitive for all Kenyans. We connect individuals 
              with qualified therapists who understand the unique challenges and experiences 
              of our communities.
            </p>
          </div>

          {/* Mission Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-foreground mb-8">Our Mission</h2>
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                To bridge the gap in mental health care across Kenya by providing a platform 
                that connects individuals with culturally competent, licensed mental health 
                professionals in a safe, confidential, and accessible environment.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We envision a Kenya where mental health is prioritized, stigma is reduced, 
                and everyone has access to the support they need to thrive.
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <Card key={index} className="border-border">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-primary rounded-lg">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-2">
                            {value.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {value.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Team Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Building Mental Health Support Together
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our team is committed to creating a supportive ecosystem where mental health 
              professionals can thrive and individuals can access the care they deserve. 
              Together, we're working to transform mental health care in Kenya.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
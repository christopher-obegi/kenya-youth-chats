import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const Contact = () => {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: "hello@mindfulkenya.com",
      description: "Send us an email and we'll respond within 24 hours"
    },
    {
      icon: Phone,
      title: "Phone",
      details: "+254 700 000 000",
      description: "Available Monday to Friday, 9 AM - 6 PM"
    },
    {
      icon: MapPin,
      title: "Location",
      details: "Nairobi, Kenya",
      description: "Serving clients across Kenya"
    },
    {
      icon: Clock,
      title: "Support Hours",
      details: "9 AM - 6 PM EAT",
      description: "Monday to Friday"
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic will be added later
    console.log("Contact form submitted");
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Have questions about our services? Need support with your account? 
              We're here to help. Reach out to us through any of the channels below.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-8">
                Contact Information
              </h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <Card key={index} className="border-border">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gradient-primary rounded-lg">
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                              {info.title}
                            </h3>
                            <p className="text-foreground font-medium mb-1">
                              {info.details}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {info.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                          First Name
                        </label>
                        <Input
                          id="firstName"
                          name="firstName"
                          required
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                          Last Name
                        </label>
                        <Input
                          id="lastName"
                          name="lastName"
                          required
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        required
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        className="w-full"
                        placeholder="Tell us how we can help you..."
                      />
                    </div>

                    <Button type="submit" className="w-full" variant="cta">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
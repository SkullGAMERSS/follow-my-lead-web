import Navbar from "@/components/Navbar";
import { MapPin, Users, Navigation, Zap, Shield, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: MapPin,
      title: "Real-Time Location Tracking",
      description: "See everyone's live location on the map with pinpoint accuracy. Never lose sight of your riding crew.",
      color: "text-primary"
    },
    {
      icon: Users,
      title: "Group Coordination",
      description: "Coordinate up to 10 riders on the same route. Perfect for motorcycle clubs, cycling groups, or adventure tours.",
      color: "text-accent"
    },
    {
      icon: Navigation,
      title: "Synced Navigation",
      description: "Everyone follows the same route to the destination. Lead or follow with confidence.",
      color: "text-primary-glow"
    },
    {
      icon: Zap,
      title: "Instant Session Creation",
      description: "Create a ride session in seconds. Just set your destination and share the code with your crew.",
      color: "text-accent"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your location is only shared during active sessions. End the session anytime to stop sharing.",
      color: "text-primary"
    },
    {
      icon: Globe,
      title: "No App Required",
      description: "Works directly in your browser. No downloads, no installations, just open and ride.",
      color: "text-primary-glow"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold">
              Powerful Features for
              <span className="block text-gradient">Group Riding</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to keep your riding crew connected and coordinated on every journey.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="border-border/50 hover-lift bg-card/50 backdrop-blur-sm"
                >
                  <CardHeader>
                    <div className="mb-4">
                      <Icon className={`w-12 h-12 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div className="inline-block p-8 rounded-3xl bg-gradient-primary/10 border border-primary/20">
              <h2 className="text-3xl font-bold mb-4">Ready to Ride Together?</h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of riders who trust RideSync for their group adventures.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Features;

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle, Share2, MapPin, Navigation } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: PlusCircle,
      title: "Create a Session",
      description: "Start by creating a new ride session. Choose your destination on the map and give your ride a name.",
      color: "bg-primary"
    },
    {
      icon: Share2,
      title: "Share the Code",
      description: "Get a unique session code. Share it with your riding crew via text, WhatsApp, or any messaging app.",
      color: "bg-accent"
    },
    {
      icon: MapPin,
      title: "Join & Track",
      description: "Your crew joins using the code. Everyone can now see each other's live location on the shared map.",
      color: "bg-primary-glow"
    },
    {
      icon: Navigation,
      title: "Ride Together",
      description: "Navigate to your destination as a group. Stay connected and coordinated throughout the entire journey.",
      color: "bg-gradient-to-br from-primary to-accent"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20 space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold">
              How <span className="text-gradient">RideSync</span> Works
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get your group riding together in four simple steps. No complicated setup, just pure coordination.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-24">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div 
                  key={index}
                  className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className={`${step.color} p-8 rounded-3xl shadow-glow hover-lift`}>
                      <Icon className="w-16 h-16 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 ${isEven ? 'md:text-left' : 'md:text-right'} text-center`}>
                    <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                      Step {index + 1}
                    </div>
                    <h2 className="text-3xl font-bold mb-4">{step.title}</h2>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto md:mx-0">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-24 text-center">
            <div className="inline-block p-12 rounded-3xl bg-card border border-border hover-lift">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Riding?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Create your first session now and experience seamless group coordination.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/create">
                  <Button size="lg" className="bg-gradient-primary hover-glow text-lg px-8">
                    Create a Ride
                  </Button>
                </Link>
                <Link to="/join">
                  <Button size="lg" variant="outline" className="text-lg px-8 border-2 border-primary hover-lift">
                    Join a Ride
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HowItWorks;

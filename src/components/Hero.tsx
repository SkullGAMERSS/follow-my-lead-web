import { Button } from "@/components/ui/button";
import { Users, MapPin, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        {/* Logo/Icon */}
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-primary to-primary-glow rounded-3xl shadow-glow mb-4">
          <Navigation className="w-12 h-12 text-primary-foreground" />
        </div>

        {/* Heading */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Never Lose Your
            <span className="block bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Riding Crew
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Keep your group together on every ride. Share routes, track locations in real-time, and ride as one.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
          <div className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300">
            <Users className="w-8 h-8 text-primary" />
            <h3 className="font-semibold text-lg">Group Coordination</h3>
            <p className="text-sm text-muted-foreground">Up to 10 riders on the same route</p>
          </div>
          <div className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300">
            <MapPin className="w-8 h-8 text-accent" />
            <h3 className="font-semibold text-lg">Real-Time Tracking</h3>
            <p className="text-sm text-muted-foreground">See everyone's live location</p>
          </div>
          <div className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300">
            <Navigation className="w-8 h-8 text-primary-glow" />
            <h3 className="font-semibold text-lg">Synced Navigation</h3>
            <p className="text-sm text-muted-foreground">Everyone follows the same route</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button 
            size="lg"
            className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow transition-all duration-300"
            onClick={() => navigate('/create')}
          >
            Create a Ride
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6 border-2 border-primary text-primary hover:bg-primary/10"
            onClick={() => navigate('/join')}
          >
            Join a Ride
          </Button>
        </div>

        {/* Trust indicator */}
        <p className="text-sm text-muted-foreground pt-8">
          No app download required • Works in your browser • Free to use
        </p>
      </div>
    </div>
  );
};

export default Hero;

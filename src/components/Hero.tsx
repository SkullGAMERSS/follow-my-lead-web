import { Button } from "@/components/ui/button";
import { Users, MapPin, Navigation, Shield, Zap, Globe, Route, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const Hero = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Group Coordination",
      description: "Coordinate up to 10 riders seamlessly on every adventure",
      color: "text-primary"
    },
    {
      icon: MapPin,
      title: "Real-Time Tracking",
      description: "Live location updates so you always know where everyone is",
      color: "text-accent"
    },
    {
      icon: Navigation,
      title: "Synced Navigation",
      description: "Everyone follows the same route to reach your destination together",
      color: "text-primary-glow"
    },
    {
      icon: Shield,
      title: "Privacy Focused",
      description: "Your location is only shared during active sessions - full control",
      color: "text-primary"
    },
    {
      icon: Zap,
      title: "Instant Setup",
      description: "Create a session in seconds, no complicated configuration needed",
      color: "text-accent"
    },
    {
      icon: Globe,
      title: "Browser Based",
      description: "No app downloads required - works instantly in any browser",
      color: "text-primary-glow"
    }
  ];

  const stats = [
    { value: "10", label: "Riders per session" },
    { value: "100%", label: "Browser based" },
    { value: "Real-time", label: "Location updates" },
    { value: "Free", label: "Always" }
  ];

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden cursor-glow">
        {/* Enhanced animated background */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary-glow/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "3s" }} />
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto text-center space-y-16">
          {/* Hero Section */}
          <div className="space-y-8">
            {/* Brand Logo */}
            <div className="inline-flex items-center justify-center p-5 bg-gradient-primary rounded-3xl shadow-glow mb-4 hover-lift">
              <Navigation className="w-14 h-14 text-primary-foreground" />
            </div>

            {/* Headline */}
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-tight">
                <span className="text-gradient">RideSync</span>
                <span className="block text-4xl md:text-5xl mt-4 text-foreground/90">
                  Never Lose Your Riding Crew
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                The ultimate real-time coordination platform for group rides. Share routes, track locations live, 
                and keep your entire crew connected from start to finish.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button 
                size="lg"
                className="text-lg px-10 py-7 bg-gradient-primary hover-glow hover-lift font-semibold"
                onClick={() => navigate('/create')}
              >
                <Route className="w-5 h-5 mr-2" />
                Create a Ride
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="text-lg px-10 py-7 border-2 border-primary text-primary hover:bg-primary/10 hover-lift font-semibold"
                onClick={() => navigate('/join')}
              >
                <Share2 className="w-5 h-5 mr-2" />
                Join a Ride
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 pt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-gradient">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="pt-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">
              Everything You Need for
              <span className="text-gradient"> Group Riding</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index}
                    className="group p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 hover-lift transition-all duration-300"
                  >
                    <Icon className={`w-10 h-10 ${feature.color} mb-4 group-hover:scale-110 transition-transform`} />
                    <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final CTA */}
          <div className="pt-12">
            <div className="inline-block p-8 rounded-3xl bg-gradient-primary/10 border border-primary/20 hover-lift">
              <p className="text-sm text-muted-foreground">
                Join thousands of riders who trust RideSync • No registration required to start
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;

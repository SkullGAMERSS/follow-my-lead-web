import Navbar from "@/components/Navbar";
import { Heart, Target, Users, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Passion for Riding",
      description: "Built by riders, for riders. We understand the thrill of group adventures.",
    },
    {
      icon: Target,
      title: "Simplicity First",
      description: "No complexity, no downloads. Just open your browser and start riding together.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Your feedback shapes our features. We're building this together.",
    },
    {
      icon: Zap,
      title: "Always Improving",
      description: "Constantly evolving with new features and improvements based on real rider needs.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20 space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold">
              About <span className="text-gradient">RideSync</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Born from the frustration of losing track of riding buddies on group rides, 
              RideSync is the solution every riding crew needs. We believe that group adventures 
              should be about the journey, not about constantly checking if everyone's still together.
            </p>
          </div>

          {/* Mission */}
          <div className="mb-20">
            <Card className="border-border/50 bg-gradient-primary/5 hover-lift">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  To make group riding effortless and safe by providing real-time coordination 
                  that works everywhere, for everyone. No apps to download, no complicated setup, 
                  just pure connection between you and your crew.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">What We Stand For</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="border-border/50 hover-lift bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-8">
                      <Icon className="w-10 h-10 text-primary mb-4" />
                      <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Story */}
          <div className="text-center">
            <div className="inline-block p-12 rounded-3xl bg-card border border-border max-w-3xl">
              <h2 className="text-3xl font-bold mb-6">The Story Behind RideSync</h2>
              <div className="text-muted-foreground space-y-4 text-left">
                <p>
                  It started on a weekend motorcycle trip through the mountains. Our group of eight riders 
                  got separated at an intersection. No one had signal. We spent 40 minutes trying to 
                  regroup instead of enjoying the ride.
                </p>
                <p>
                  That's when the idea hit us: there had to be a better way. Not another app to download 
                  and forget about, but something instant, simple, and reliable that works right in your 
                  browser when you need it most.
                </p>
                <p>
                  Today, RideSync helps thousands of riders stay connected on their adventures. Whether 
                  you're touring cross-country, exploring backroads, or just cruising with friends, 
                  we're here to make sure you never lose your crew again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;

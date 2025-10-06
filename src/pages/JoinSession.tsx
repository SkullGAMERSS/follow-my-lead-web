import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Users } from "lucide-react";

const JoinSession = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionCode, setSessionCode] = useState("");
  const [displayName, setDisplayName] = useState("");

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionCode.trim() || !displayName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide your name and session code",
        variant: "destructive",
      });
      return;
    }

    // Navigate to session with name as query param
    navigate(`/session/${sessionCode.toUpperCase()}?name=${encodeURIComponent(displayName)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border shadow-card">
        <CardHeader className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-accent to-accent/80 rounded-2xl mx-auto">
            <Users className="w-8 h-8 text-accent-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">Join a Ride</CardTitle>
          <CardDescription className="text-base">
            Enter the session code to join your group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoinSession} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Your Name</Label>
              <Input
                id="name"
                placeholder="Jane Smith"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-input border-border focus:ring-accent"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium">Session Code</Label>
              <Input
                id="code"
                placeholder="ABC123"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                className="bg-input border-border focus:ring-accent text-xl font-mono tracking-wider text-center"
                maxLength={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                Get this code from the ride host
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-accent to-accent/80 text-accent-foreground hover:shadow-glow transition-all duration-300"
              size="lg"
            >
              Join Ride
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full border-border"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinSession;

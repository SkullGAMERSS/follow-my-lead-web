import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { nanoid } from "nanoid";
import { MapPin, Navigation, Target } from "lucide-react";
import MapSelector from "@/components/MapSelector";
import type { User } from "@supabase/supabase-js";

const CreateSession = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [destination, setDestination] = useState("");
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create a ride session",
          variant: "destructive",
        });
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in first",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!destination.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a destination",
        variant: "destructive",
      });
      return;
    }

    if (!destinationCoords) {
      toast({
        title: "Select destination",
        description: "Please click on the map to set your destination",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get user's display name from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      // Generate unique session code
      const sessionCode = nanoid(6).toUpperCase();
      
      const { data: session, error: sessionError } = await supabase
        .from("ride_sessions")
        .insert({
          session_code: sessionCode,
          host_id: user.id,
          destination_lat: destinationCoords.lat,
          destination_lng: destinationCoords.lng,
          destination_address: destination,
          status: "waiting",
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Add host as participant
      const { error: participantError } = await supabase
        .from("participants")
        .insert({
          session_id: session.id,
          user_id: user.id,
          display_name: profile?.display_name || "Host",
          is_host: true,
        });

      if (participantError) throw participantError;

      toast({
        title: "Session created!",
        description: `Share code: ${sessionCode}`,
      });

      // Navigate to the session
      navigate(`/session/${sessionCode}`);
    } catch (error: any) {
      console.error("Error creating session:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border shadow-card">
        <CardHeader className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-primary to-primary-glow rounded-2xl mx-auto shadow-glow">
            <Navigation className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">Create a Ride</CardTitle>
          <CardDescription className="text-base">
            Set up a new group ride session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateSession} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="destination" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                Destination
              </Label>
              <Input
                id="destination"
                placeholder="e.g. Sunset Point Lookout"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="bg-input border-border focus:ring-primary"
                required
              />
              
              {destinationCoords && (
                <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-primary font-medium">
                    Location selected: {destinationCoords.lat.toFixed(4)}, {destinationCoords.lng.toFixed(4)}
                  </span>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full border-primary/30 hover:bg-primary/10 hover:border-primary"
                onClick={() => setShowMap(!showMap)}
              >
                <MapPin className="w-4 h-4 mr-2" />
                {showMap ? "Hide Map" : "Pick Location on Map"}
              </Button>

              {showMap && (
                <div className="rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg">
                  <MapSelector
                    onLocationSelect={(coords) => {
                      setDestinationCoords(coords);
                      toast({
                        title: "Location selected!",
                        description: "You can now create your session",
                      });
                    }}
                  />
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow transition-all duration-300"
              disabled={loading}
              size="lg"
            >
              {loading ? "Creating..." : "Create Session"}
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

export default CreateSession;

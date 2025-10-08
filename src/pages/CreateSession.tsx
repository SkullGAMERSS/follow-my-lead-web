import { useState } from "react";
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

const CreateSession = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [destination, setDestination] = useState("");
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(false);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim() || !destination.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide your name and destination",
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
      // Generate unique session code
      const sessionCode = nanoid(6).toUpperCase();
      
      const { data: session, error: sessionError } = await supabase
        .from("ride_sessions")
        .insert({
          session_code: sessionCode,
          host_id: crypto.randomUUID(),
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
          user_id: session.host_id,
          display_name: displayName,
          is_host: true,
        });

      if (participantError) throw participantError;

      toast({
        title: "Session created!",
        description: `Share code: ${sessionCode}`,
      });

      // Navigate to the session
      navigate(`/session/${sessionCode}`);
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Error",
        description: "Failed to create session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Your Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-input border-border focus:ring-primary"
                required
              />
            </div>

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

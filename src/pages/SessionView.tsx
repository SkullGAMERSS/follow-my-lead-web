import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, MapPin, Users, Navigation, Circle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type RideSession = Database["public"]["Tables"]["ride_sessions"]["Row"];
type Participant = Database["public"]["Tables"]["participants"]["Row"];

const SessionView = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [session, setSession] = useState<RideSession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId] = useState(crypto.randomUUID());
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (!code) return;
    loadSession();
    subscribeToUpdates();
  }, [code]);

  const loadSession = async () => {
    try {
      // Load session data
      const { data: sessionData, error: sessionError } = await supabase
        .from("ride_sessions")
        .select("*")
        .eq("session_code", code!)
        .single();

      if (sessionError) throw sessionError;
      if (!sessionData) {
        toast({
          title: "Session not found",
          description: "This ride session doesn't exist",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setSession(sessionData);

      // Load participants
      const { data: participantsData, error: participantsError } = await supabase
        .from("participants")
        .select("*")
        .eq("session_id", sessionData.id)
        .order("joined_at", { ascending: true });

      if (participantsError) throw participantsError;
      setParticipants(participantsData || []);

      // Check if user needs to join
      const displayName = searchParams.get("name");
      const existingParticipant = participantsData?.find(p => p.user_id === currentUserId);
      
      if (!existingParticipant && displayName) {
        await joinSession(sessionData.id, displayName);
      } else if (existingParticipant) {
        setHasJoined(true);
        startLocationTracking(sessionData.id, existingParticipant.id);
      }

    } catch (error) {
      console.error("Error loading session:", error);
      toast({
        title: "Error",
        description: "Failed to load session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const joinSession = async (sessionId: string, displayName: string) => {
    try {
      const { error } = await supabase
        .from("participants")
        .insert({
          session_id: sessionId,
          user_id: currentUserId,
          display_name: displayName,
          is_host: false,
        });

      if (error) throw error;
      
      setHasJoined(true);
      toast({
        title: "Joined successfully!",
        description: "You're now part of the ride",
      });
      
      loadSession(); // Reload to get participant ID
    } catch (error) {
      console.error("Error joining session:", error);
      toast({
        title: "Error",
        description: "Failed to join session",
        variant: "destructive",
      });
    }
  };

  const startLocationTracking = (sessionId: string, participantId: string) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          supabase
            .from("participants")
            .update({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            })
            .eq("id", participantId)
            .then(() => console.log("Location updated"));
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            title: "Location access needed",
            description: "Please enable location permissions",
            variant: "destructive",
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }
  };

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel(`session-${code}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
        },
        () => {
          loadSession();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const copySessionCode = () => {
    navigator.clipboard.writeText(code!);
    toast({
      title: "Copied!",
      description: "Session code copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen p-6 pb-24">
      {/* Header */}
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary to-primary-glow rounded-xl">
                  <Navigation className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Ride Session</h1>
                  <p className="text-sm text-muted-foreground">
                    {session.status === "waiting" ? "Waiting to start" : session.status === "active" ? "In progress" : "Ended"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="font-medium">{session.destination_address}</span>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-lg font-mono px-4 py-2">
                  {session.session_code}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copySessionCode}
                  className="text-muted-foreground"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Badge 
              variant={session.status === "active" ? "default" : "secondary"}
              className="text-sm"
            >
              {session.status}
            </Badge>
          </div>
        </Card>

        {/* Participants */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">
              Participants ({participants.length}/10)
            </h2>
          </div>
          
          <div className="space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Circle
                      className={`w-3 h-3 ${
                        participant.latitude && participant.longitude
                          ? "fill-primary text-primary"
                          : "fill-muted text-muted"
                      } animate-pulse`}
                    />
                  </div>
                  <span className="font-medium">{participant.display_name}</span>
                  {participant.is_host && (
                    <Badge variant="secondary" className="text-xs">
                      Host
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {participant.latitude && participant.longitude
                    ? "Location active"
                    : "Waiting for GPS"}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Map placeholder - will be enhanced with Google Maps */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
          <div className="aspect-video bg-secondary/30 rounded-xl flex items-center justify-center border-2 border-dashed border-border">
            <div className="text-center space-y-2">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Map view coming soon</p>
              <p className="text-sm text-muted-foreground">
                Real-time participant tracking will appear here
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-6xl mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/")}
          >
            Leave Session
          </Button>
          {session.status === "waiting" && participants.some(p => p.user_id === currentUserId && p.is_host) && (
            <Button
              className="flex-1 bg-gradient-to-r from-primary to-primary-glow"
              onClick={async () => {
                await supabase
                  .from("ride_sessions")
                  .update({ status: "active", started_at: new Date().toISOString() })
                  .eq("id", session.id);
                toast({ title: "Ride started!" });
              }}
            >
              Start Ride
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionView;

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, MapPin, Users, Navigation, Circle, Play } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import Map from "@/components/Map";
import type { User } from "@supabase/supabase-js";

type RideSession = Database["public"]["Tables"]["ride_sessions"]["Row"];
type Participant = Database["public"]["Tables"]["participants"]["Row"];

const SessionView = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [session, setSession] = useState<RideSession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to view this session",
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

  useEffect(() => {
    if (!code || !user) return;
    loadSession();
    const unsubscribe = subscribeToUpdates();
    return unsubscribe;
  }, [code, user]);

  const loadSession = async () => {
    if (!user) return;

    try {
      // Load session data
      const { data: sessionData, error: sessionError } = await supabase
        .from("ride_sessions")
        .select("*")
        .eq("session_code", code!)
        .maybeSingle();

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

      // Check if user is already a participant
      const existingParticipant = participantsData?.find(p => p.user_id === user.id);
      
      if (!existingParticipant) {
        await joinSession(sessionData.id);
      } else {
        setCurrentParticipant(existingParticipant);
        startLocationTracking(existingParticipant.id);
      }

    } catch (error: any) {
      console.error("Error loading session:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const joinSession = async (sessionId: string) => {
    if (!user) return;

    try {
      // Get user's display name from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();

      const { data, error } = await supabase
        .from("participants")
        .insert({
          session_id: sessionId,
          user_id: user.id,
          display_name: profile?.display_name || "Rider",
          is_host: false,
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      
      setCurrentParticipant(data);
      toast({
        title: "Joined successfully!",
        description: "You're now part of the ride",
      });
      
      startLocationTracking(data.id);
      loadSession(); // Reload to get updated participant list
    } catch (error: any) {
      console.error("Error joining session:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to join session",
        variant: "destructive",
      });
    }
  };

  const startLocationTracking = (participantId: string) => {
    if ("geolocation" in navigator) {
      let hasShownError = false;
      
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          supabase
            .from("participants")
            .update({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            })
            .eq("id", participantId)
            .then(({ error }) => {
              if (error) {
                // Silently log database update errors to prevent notification spam
                console.error("Location update error:", error);
              }
            });
        },
        (error) => {
          // Only show error toast once to prevent spam
          if (!hasShownError) {
            hasShownError = true;
            console.error("Geolocation error:", error);
            toast({
              title: "Location access needed",
              description: "Please enable location permissions to share your position",
              variant: "destructive",
            });
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
      
      // Store watchId to clear it later if needed
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
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
          if (user) {
            loadSession();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ride_sessions",
        },
        () => {
          if (user) {
            loadSession();
          }
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

  const handleStartRide = async () => {
    if (!session || !user) return;

    try {
      const { error } = await supabase
        .from("ride_sessions")
        .update({ status: "active", started_at: new Date().toISOString() })
        .eq("id", session.id);

      if (error) throw error;

      toast({ 
        title: "Ride started!",
        description: "All participants can now follow the route" 
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start ride",
        variant: "destructive",
      });
    }
  };

  const handleLeaveSession = async () => {
    if (!currentParticipant) {
      navigate("/");
      return;
    }

    try {
      const { error } = await supabase
        .from("participants")
        .delete()
        .eq("id", currentParticipant.id);

      if (error) throw error;

      toast({
        title: "Left session",
        description: "You've left the ride session",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to leave session",
        variant: "destructive",
      });
    }
  };

  if (loading || !user) {
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

  const isHost = currentParticipant?.is_host || false;

  return (
    <div className="min-h-screen p-6 pb-24">
      {/* Header */}
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border hover-lift">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary to-primary-glow rounded-xl shadow-glow">
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
                <Badge variant="outline" className="text-lg font-mono px-4 py-2 border-primary/50">
                  {session.session_code}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copySessionCode}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Badge 
              variant={session.status === "active" ? "default" : "secondary"}
              className="text-sm px-4 py-1"
            >
              {session.status}
            </Badge>
          </div>
        </Card>

        {/* Participants */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border hover-lift">
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
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Circle
                      className={`w-3 h-3 ${
                        participant.latitude && participant.longitude
                          ? "fill-primary text-primary animate-pulse"
                          : "fill-muted text-muted"
                      }`}
                    />
                  </div>
                  <span className="font-medium">{participant.display_name}</span>
                  {participant.is_host && (
                    <Badge variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/30">
                      Host
                    </Badge>
                  )}
                  {participant.user_id === user.id && (
                    <Badge variant="outline" className="text-xs">
                      You
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

        {/* Live Map */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-border hover-lift">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Live Tracking</h2>
          </div>
          <Map 
            participants={participants}
            destination={session.destination_lat && session.destination_lng ? {
              lat: session.destination_lat,
              lng: session.destination_lng
            } : null}
          />
        </Card>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-6xl mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
            onClick={handleLeaveSession}
          >
            Leave Session
          </Button>
          {session.status === "waiting" && isHost && (
            <Button
              className="flex-1 bg-gradient-to-r from-primary to-primary-glow hover-glow"
              onClick={handleStartRide}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Ride
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionView;

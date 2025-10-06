-- Create ride_sessions table
CREATE TABLE public.ride_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_code TEXT NOT NULL UNIQUE,
  host_id UUID NOT NULL,
  destination_lat DOUBLE PRECISION NOT NULL,
  destination_lng DOUBLE PRECISION NOT NULL,
  destination_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create participants table
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.ride_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_host BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.ride_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Create policies for ride_sessions (public read for joining via link)
CREATE POLICY "Anyone can view sessions"
  ON public.ride_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create sessions"
  ON public.ride_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Hosts can update their sessions"
  ON public.ride_sessions
  FOR UPDATE
  USING (host_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create policies for participants
CREATE POLICY "Anyone can view participants in their session"
  ON public.participants
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can join sessions"
  ON public.participants
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own participant data"
  ON public.participants
  FOR UPDATE
  USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete themselves from sessions"
  ON public.participants
  FOR DELETE
  USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create function to update last_update timestamp
CREATE OR REPLACE FUNCTION public.update_participant_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_update = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_participant_timestamp_trigger
  BEFORE UPDATE ON public.participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_participant_timestamp();

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
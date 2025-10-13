-- Fix infinite recursion in RLS policies by using security definer function

-- Drop and recreate the ride_sessions SELECT policy
DROP POLICY IF EXISTS "Users can view sessions they participate in" ON public.ride_sessions;

CREATE POLICY "Users can view sessions they participate in" 
ON public.ride_sessions FOR SELECT
USING (
  -- Use security definer function to avoid recursion
  public.user_is_in_session(auth.uid(), id) OR host_id = auth.uid()
);

-- Drop and recreate the participants SELECT policy
DROP POLICY IF EXISTS "Users can view participants in accessible sessions" ON public.participants;

CREATE POLICY "Users can view participants in accessible sessions" 
ON public.participants FOR SELECT
USING (
  -- Use security definer function to check if user is in the same session
  public.user_is_in_session(auth.uid(), session_id)
);
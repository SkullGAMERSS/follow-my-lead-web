-- Drop existing policy that prevents non-participants from viewing sessions
DROP POLICY IF EXISTS "Users can view sessions they participate in" ON public.ride_sessions;

-- Create new policy that allows authenticated users to view sessions by code
CREATE POLICY "Authenticated users can view sessions"
ON public.ride_sessions
FOR SELECT
TO authenticated
USING (true);

-- Keep the insert policy (only hosts can create)
-- Keep the update policy (only hosts can update)

-- Also update participants policy to allow users to see all participants in sessions they can access
DROP POLICY IF EXISTS "Users can view participants in accessible sessions" ON public.participants;

CREATE POLICY "Authenticated users can view all participants"
ON public.participants
FOR SELECT
TO authenticated
USING (true);
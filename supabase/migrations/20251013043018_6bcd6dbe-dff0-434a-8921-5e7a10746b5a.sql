-- Fix infinite recursion in participants RLS policy
-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view participants in sessions they joined" ON public.participants;

-- Create a security definer function to check if user is in a session
CREATE OR REPLACE FUNCTION public.user_is_in_session(_user_id uuid, _session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.participants
    WHERE user_id = _user_id
      AND session_id = _session_id
  )
$$;

-- Create new policy using the security definer function
CREATE POLICY "Users can view participants in their sessions"
ON public.participants
FOR SELECT
USING (public.user_is_in_session(auth.uid(), session_id));
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view participants in their session" ON public.participants;
DROP POLICY IF EXISTS "Anyone can join sessions" ON public.participants;
DROP POLICY IF EXISTS "Anyone can view sessions" ON public.ride_sessions;
DROP POLICY IF EXISTS "Anyone can create sessions" ON public.ride_sessions;

-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', 'User')
  );
  RETURN new;
END;
$$;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update profile timestamp
CREATE OR REPLACE FUNCTION public.update_profile_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for profile updates
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_timestamp();

-- Secure participants policies
CREATE POLICY "Users can view participants in sessions they joined"
  ON public.participants FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT session_id FROM public.participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can join sessions"
  ON public.participants FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Secure ride_sessions policies
CREATE POLICY "Users can view sessions they participate in"
  ON public.ride_sessions FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT session_id FROM public.participants WHERE user_id = auth.uid())
    OR host_id = auth.uid()
  );

CREATE POLICY "Authenticated users can create sessions"
  ON public.ride_sessions FOR INSERT
  TO authenticated
  WITH CHECK (host_id = auth.uid());
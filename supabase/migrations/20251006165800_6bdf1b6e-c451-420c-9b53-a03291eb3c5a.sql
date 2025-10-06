-- Fix the function search path security issue with CASCADE
DROP FUNCTION IF EXISTS public.update_participant_timestamp() CASCADE;

CREATE OR REPLACE FUNCTION public.update_participant_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_update = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER update_participant_timestamp_trigger
  BEFORE UPDATE ON public.participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_participant_timestamp();
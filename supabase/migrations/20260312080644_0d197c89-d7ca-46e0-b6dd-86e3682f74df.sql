
-- Create event_rsvps table for users to join events
CREATE TABLE public.event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Everyone can see RSVPs
CREATE POLICY "RSVPs are viewable by everyone" ON public.event_rsvps
  FOR SELECT USING (true);

-- Authenticated users can RSVP
CREATE POLICY "Users can RSVP to events" ON public.event_rsvps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can cancel their RSVP
CREATE POLICY "Users can cancel their RSVP" ON public.event_rsvps
  FOR DELETE USING (auth.uid() = user_id);

-- Update events SELECT policy to allow all events to be visible (private ones too, for joining)
DROP POLICY IF EXISTS "Public events are viewable by everyone" ON public.events;
CREATE POLICY "Events are viewable by everyone" ON public.events
  FOR SELECT USING (true);

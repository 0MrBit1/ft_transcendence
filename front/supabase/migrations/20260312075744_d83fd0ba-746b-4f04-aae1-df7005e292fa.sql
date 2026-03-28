
-- Add approval_status to organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Create events table
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  location text,
  event_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone,
  event_type text NOT NULL DEFAULT 'general',
  tags text[] DEFAULT '{}',
  is_private boolean NOT NULL DEFAULT false,
  max_attendees integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public events are viewable by everyone" ON public.events
  FOR SELECT USING (
    is_private = false OR
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = events.organization_id
      AND organization_members.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.organizations
      WHERE organizations.id = events.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Approved org owners can create events" ON public.events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organizations
      WHERE organizations.id = events.organization_id
      AND organizations.user_id = auth.uid()
      AND organizations.approval_status = 'approved'
    )
  );

CREATE POLICY "Org owners can update events" ON public.events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.organizations
      WHERE organizations.id = events.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Org owners can delete events" ON public.events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.organizations
      WHERE organizations.id = events.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update organizations" ON public.organizations
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

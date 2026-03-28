-- Create chat messages table
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Only org members (including owner) can read messages
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members WHERE user_id = _user_id AND organization_id = _org_id
  ) OR EXISTS (
    SELECT 1 FROM public.organizations WHERE id = _org_id AND user_id = _user_id
  )
$$;

-- SELECT: org members can read
CREATE POLICY "Org members can read chat" ON public.chat_messages
FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

-- INSERT: org members can send
CREATE POLICY "Org members can send chat" ON public.chat_messages
FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_org_member(auth.uid(), organization_id));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
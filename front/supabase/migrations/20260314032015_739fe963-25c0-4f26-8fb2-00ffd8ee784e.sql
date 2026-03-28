-- Add status column to event_rsvps for approval workflow
ALTER TABLE public.event_rsvps ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- Allow org owners to update RSVPs (approve/reject)
CREATE POLICY "Org owners can update rsvps" ON public.event_rsvps
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.organizations o ON o.id = e.organization_id
    WHERE e.id = event_rsvps.event_id AND o.user_id = auth.uid()
  )
);
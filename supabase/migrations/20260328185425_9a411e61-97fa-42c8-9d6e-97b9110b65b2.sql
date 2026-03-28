
-- Fix 1: Drop overly permissive SELECT policy on admin_emails and replace with admin-only
DROP POLICY IF EXISTS "Anyone authenticated can check admin" ON public.admin_emails;
CREATE POLICY "Admins can view admin_emails" ON public.admin_emails
  FOR SELECT TO authenticated
  USING (is_admin((auth.jwt() ->> 'email'::text)));

-- Fix 2: Remove NULL user_id allowance from events INSERT policy
DROP POLICY IF EXISTS "Users can insert own events" ON public.events;
CREATE POLICY "Users can insert own events" ON public.events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

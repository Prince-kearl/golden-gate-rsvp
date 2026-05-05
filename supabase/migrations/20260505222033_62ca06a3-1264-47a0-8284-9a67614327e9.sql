
-- Allow admins to manage user roles
CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Helper function for admins to look up a user id by email (avoids exposing auth.users)
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(_email text)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM auth.users WHERE email = _email LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_user_id_by_email(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(text) TO authenticated;

-- Seed initial admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('08f684b6-1b4a-4eb9-89a4-afe8732a2d86', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;


-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Admins can view roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RSVPs
CREATE TABLE public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  attendance TEXT NOT NULL CHECK (attendance IN ('yes','no','maybe')),
  message TEXT,
  checked_in BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Anyone (anon or authed) can insert an RSVP
CREATE POLICY "Anyone can submit RSVP" ON public.rsvps
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can view RSVPs" ON public.rsvps
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update (for check-in)
CREATE POLICY "Admins can update RSVPs" ON public.rsvps
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete RSVPs" ON public.rsvps
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow checking if a phone exists (for duplicate prevention) via RPC
CREATE OR REPLACE FUNCTION public.phone_exists(_phone TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.rsvps WHERE phone = _phone)
$$;

GRANT EXECUTE ON FUNCTION public.phone_exists(TEXT) TO anon, authenticated;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.rsvps;
ALTER TABLE public.rsvps REPLICA IDENTITY FULL;

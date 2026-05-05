
CREATE OR REPLACE FUNCTION public.list_admins()
RETURNS TABLE(user_id uuid, email text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
    SELECT ur.user_id, u.email::text
    FROM public.user_roles ur
    JOIN auth.users u ON u.id = ur.user_id
    WHERE ur.role = 'admin'
    ORDER BY u.email;
END;
$$;

REVOKE ALL ON FUNCTION public.list_admins() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.list_admins() TO authenticated;

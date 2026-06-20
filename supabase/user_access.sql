-- Role and permission structure for dashboard access.
-- Apply this before tightening module-specific RLS policies.

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'staff'
    CHECK (role IN ('root_admin', 'admin', 'staff')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_menu_permissions (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  menu_key text NOT NULL CHECK (
    menu_key IN (
      'dashboard',
      'landing',
      'kajian',
      'events',
      'finance',
      'ustad',
      'jamaah',
      'management',
      'users',
      'settings'
    )
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, menu_key)
);

CREATE TABLE IF NOT EXISTS public.user_finance_categories (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('Sosial', 'Kajian', 'Operasional')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, category)
);

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_menu_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_finance_categories ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_root_admin(uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = uid
      AND role = 'root_admin'
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = uid
      AND role IN ('root_admin', 'admin')
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_menu(menu text, uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_admin(uid)
    OR menu = 'dashboard'
    OR EXISTS (
      SELECT 1
      FROM public.user_menu_permissions
      WHERE user_id = uid
        AND menu_key = menu
    );
$$;

CREATE OR REPLACE FUNCTION public.can_access_finance_category(finance_category text, uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_admin(uid)
    OR EXISTS (
      SELECT 1
      FROM public.user_finance_categories
      WHERE user_id = uid
        AND category = finance_category
    );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_role text;
BEGIN
  SELECT CASE
    WHEN NEW.raw_user_meta_data->>'role' = 'root_admin' THEN 'root_admin'
    WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'
    WHEN NEW.raw_user_meta_data->>'role' = 'staff' THEN 'staff'
    WHEN EXISTS (SELECT 1 FROM public.profiles) THEN 'staff'
    ELSE 'root_admin'
  END INTO new_role;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, ''), '@', 1)),
    new_role
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_menu_permissions (user_id, menu_key)
  VALUES (NEW.id, 'dashboard')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Bootstrap existing auth users. The oldest existing user becomes root_admin
-- when there is no root_admin profile yet.
INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
SELECT
  u.id,
  COALESCE(u.email, ''),
  COALESCE(u.raw_user_meta_data->>'name', split_part(COALESCE(u.email, ''), '@', 1)),
  CASE
    WHEN u.raw_user_meta_data->>'role' = 'root_admin' THEN 'root_admin'
    WHEN u.raw_user_meta_data->>'role' = 'admin' THEN 'admin'
    WHEN u.raw_user_meta_data->>'role' = 'staff' THEN 'staff'
    WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'root_admin')
      AND row_number() OVER (ORDER BY u.created_at ASC) = 1
    THEN 'root_admin'
    ELSE 'staff'
  END,
  COALESCE(u.created_at, now()),
  now()
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- Repair existing profiles created before this script respected legacy metadata roles.
UPDATE public.profiles p
SET role = CASE
    WHEN u.raw_user_meta_data->>'role' = 'root_admin' THEN 'root_admin'
    WHEN u.raw_user_meta_data->>'role' = 'admin' THEN 'admin'
    WHEN u.raw_user_meta_data->>'role' = 'staff' THEN 'staff'
    ELSE p.role
  END,
  updated_at = now()
FROM auth.users u
WHERE p.id = u.id
  AND u.raw_user_meta_data->>'role' IN ('root_admin', 'admin', 'staff')
  AND p.role IS DISTINCT FROM u.raw_user_meta_data->>'role';

INSERT INTO public.user_menu_permissions (user_id, menu_key)
SELECT p.id, 'dashboard'
FROM public.profiles p
ON CONFLICT DO NOTHING;

INSERT INTO public.user_menu_permissions (user_id, menu_key)
SELECT p.id, menu_key
FROM public.profiles p
CROSS JOIN unnest(ARRAY[
  'dashboard',
  'landing',
  'kajian',
  'events',
  'finance',
  'ustad',
  'jamaah',
  'management',
  'users',
  'settings'
]) AS menu_key
WHERE p.role IN ('root_admin', 'admin')
ON CONFLICT DO NOTHING;

INSERT INTO public.user_finance_categories (user_id, category)
SELECT p.id, category
FROM public.profiles p
CROSS JOIN unnest(ARRAY['Sosial', 'Kajian', 'Operasional']) AS category
WHERE p.role IN ('root_admin', 'admin')
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own menu permissions" ON public.user_menu_permissions;
DROP POLICY IF EXISTS "Admins can manage menu permissions" ON public.user_menu_permissions;
DROP POLICY IF EXISTS "Users can read own finance categories" ON public.user_finance_categories;
DROP POLICY IF EXISTS "Admins can manage finance categories" ON public.user_finance_categories;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    id <> auth.uid()
    AND (
      (public.is_root_admin() AND role <> 'root_admin')
      OR (
        public.is_admin()
        AND NOT public.is_root_admin()
        AND role = 'staff'
      )
    )
  )
  WITH CHECK (
    id <> auth.uid()
    AND (
      (public.is_root_admin() AND role <> 'root_admin')
      OR (
        public.is_admin()
        AND NOT public.is_root_admin()
        AND role = 'staff'
      )
    )
  );

CREATE POLICY "Users can read own menu permissions"
  ON public.user_menu_permissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can manage menu permissions"
  ON public.user_menu_permissions FOR ALL
  TO authenticated
  USING (
    user_id <> auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles target
      WHERE target.id = user_id
        AND (
          (public.is_root_admin() AND target.role <> 'root_admin')
          OR (
            public.is_admin()
            AND NOT public.is_root_admin()
            AND target.role = 'staff'
          )
        )
    )
  )
  WITH CHECK (
    user_id <> auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles target
      WHERE target.id = user_id
        AND (
          (public.is_root_admin() AND target.role <> 'root_admin')
          OR (
            public.is_admin()
            AND NOT public.is_root_admin()
            AND target.role = 'staff'
          )
        )
    )
  );

CREATE POLICY "Users can read own finance categories"
  ON public.user_finance_categories FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can manage finance categories"
  ON public.user_finance_categories FOR ALL
  TO authenticated
  USING (
    user_id <> auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles target
      WHERE target.id = user_id
        AND (
          (public.is_root_admin() AND target.role <> 'root_admin')
          OR (
            public.is_admin()
            AND NOT public.is_root_admin()
            AND target.role = 'staff'
          )
        )
    )
  )
  WITH CHECK (
    user_id <> auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles target
      WHERE target.id = user_id
        AND (
          (public.is_root_admin() AND target.role <> 'root_admin')
          OR (
            public.is_admin()
            AND NOT public.is_root_admin()
            AND target.role = 'staff'
          )
        )
    )
  );

GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.user_menu_permissions TO authenticated;
GRANT SELECT ON public.user_finance_categories TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
GRANT INSERT, DELETE ON public.user_menu_permissions TO authenticated;
GRANT INSERT, DELETE ON public.user_finance_categories TO authenticated;

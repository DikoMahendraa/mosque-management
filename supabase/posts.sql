CREATE TABLE IF NOT EXISTS public.posts (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text        NOT NULL,
  slug           text        NOT NULL UNIQUE,
  content        text        NOT NULL DEFAULT '',
  cover_image    text        NOT NULL DEFAULT '',
  author         text        NOT NULL DEFAULT '',
  category       text        NOT NULL DEFAULT '',
  published_date date,
  status         text        NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft', 'published')),
  created_by     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS posts_updated_at ON public.posts;
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_posts_status         ON public.posts (status);
CREATE INDEX IF NOT EXISTS idx_posts_published_date ON public.posts (published_date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category       ON public.posts (category);

DROP POLICY IF EXISTS "Public can read published posts"                        ON public.posts;
DROP POLICY IF EXISTS "Authenticated users with posts access can read posts"   ON public.posts;
DROP POLICY IF EXISTS "Authenticated users with posts access can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users with posts access can update posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users with posts access can delete posts" ON public.posts;

CREATE POLICY "Public can read published posts"
  ON public.posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users with posts access can read posts"
  ON public.posts FOR SELECT
  TO authenticated
  USING (public.can_access_menu('posts'));

CREATE POLICY "Authenticated users with posts access can insert posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (public.can_access_menu('posts'));

CREATE POLICY "Authenticated users with posts access can update posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (public.can_access_menu('posts'))
  WITH CHECK (public.can_access_menu('posts'));

CREATE POLICY "Authenticated users with posts access can delete posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (public.can_access_menu('posts'));

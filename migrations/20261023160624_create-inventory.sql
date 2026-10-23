CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  description text NOT NULL DEFAULT '' CHECK (length(description) <= 500),
  color text NOT NULL DEFAULT '#FF6600',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, user_id)
);

CREATE TABLE public.bins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id uuid NOT NULL,
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  description text NOT NULL DEFAULT '' CHECK (length(description) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, user_id),
  FOREIGN KEY (room_id, user_id) REFERENCES public.rooms(id, user_id) ON DELETE CASCADE
);

CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  bin_id uuid NOT NULL,
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  description text NOT NULL DEFAULT '' CHECK (length(description) <= 1000),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 9999),
  value numeric(12, 2) NOT NULL DEFAULT 0 CHECK (value >= 0),
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (bin_id, user_id) REFERENCES public.bins(id, user_id) ON DELETE CASCADE
);

CREATE INDEX rooms_user_id_idx ON public.rooms(user_id);
CREATE INDEX bins_user_room_idx ON public.bins(user_id, room_id);
CREATE INDEX items_user_bin_idx ON public.items(user_id, bin_id);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY rooms_owner_select ON public.rooms FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY rooms_owner_insert ON public.rooms FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY rooms_owner_update ON public.rooms FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY rooms_owner_delete ON public.rooms FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY bins_owner_select ON public.bins FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY bins_owner_insert ON public.bins FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY bins_owner_update ON public.bins FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY bins_owner_delete ON public.bins FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY items_owner_select ON public.items FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY items_owner_insert ON public.items FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY items_owner_update ON public.items FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY items_owner_delete ON public.items FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

REVOKE ALL ON public.rooms, public.bins, public.items FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.rooms, public.bins, public.items TO authenticated;
GRANT UPDATE (name, description, color) ON public.rooms TO authenticated;
GRANT UPDATE (name, description, room_id) ON public.bins TO authenticated;
GRANT UPDATE (name, description, quantity, value, photo_url, bin_id) ON public.items TO authenticated;

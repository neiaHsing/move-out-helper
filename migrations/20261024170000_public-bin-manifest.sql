-- Anonymous QR scans can read one box manifest by its opaque UUID. Keep the
-- base inventory tables private and expose only the fields needed for viewing.
CREATE OR REPLACE FUNCTION public.get_public_bin_manifest(p_bin_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT jsonb_build_object(
    'bin', jsonb_build_object(
      'id', b.id,
      'name', b.name,
      'description', b.description
    ),
    'roomName', r.name,
    'items', COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', i.id,
          'name', i.name,
          'description', i.description,
          'quantity', i.quantity
        ) ORDER BY i.created_at, i.id
      ) FILTER (WHERE i.id IS NOT NULL),
      '[]'::jsonb
    )
  )
  FROM public.bins AS b
  JOIN public.rooms AS r
    ON r.id = b.room_id
   AND r.user_id = b.user_id
  LEFT JOIN public.items AS i
    ON i.bin_id = b.id
   AND i.user_id = b.user_id
  WHERE b.id = p_bin_id
  GROUP BY b.id, r.id;
$$;

REVOKE ALL ON FUNCTION public.get_public_bin_manifest(uuid) FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_bin_manifest(uuid) TO anon, authenticated;

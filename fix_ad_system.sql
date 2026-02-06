-- Ensure Ads table is public read
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to active ads" ON ads;

CREATE POLICY "Allow public read access to active ads"
ON ads FOR SELECT
USING (true);

-- Ensure RPC functions exist for atomic increments
CREATE OR REPLACE FUNCTION increment_ad_views(ad_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ads
  SET views = views + 1
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_ad_clicks(ad_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ads
  SET clicks = clicks + 1
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to public/anon
GRANT EXECUTE ON FUNCTION increment_ad_views(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION increment_ad_clicks(UUID) TO anon, authenticated, service_role;

-- Fix potentially NULL start_dates in existing data
UPDATE ads SET start_date = NOW() WHERE start_date IS NULL;

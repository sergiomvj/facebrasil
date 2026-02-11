-- Enable RLS on categories table (plural, lowercase)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for anon users and authenticated users)
CREATE POLICY "Allow public read access to categories"
ON public.categories
FOR SELECT
TO public
USING (true);

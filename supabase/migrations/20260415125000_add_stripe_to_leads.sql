ALTER TABLE public.advertising_leads 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS stripe_session_id text,
ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Opcional: Adicionar política para permitir que o webhook atualize esses campos (via service role)
-- Como o webhook usa supabaseAdmin (service_role), as políticas de RLS normais não se aplicam.

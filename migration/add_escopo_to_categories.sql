ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS escopo text[] DEFAULT '{}';
COMMENT ON COLUMN public.categories.escopo IS 'Lista de tópicos/temas sugeridos para a categoria (usado no gerador IA)';

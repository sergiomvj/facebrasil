-- Add write policies to categories table
-- This allows authenticated users (Admins) to manage categories

-- 1. Permissão de Inserção
CREATE POLICY "Allow authenticated insert to categories"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Permissão de Atualização
CREATE POLICY "Allow authenticated update to categories"
ON public.categories
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Permissão de Exclusão
CREATE POLICY "Allow authenticated delete from categories"
ON public.categories
FOR DELETE
TO authenticated
USING (true);

-- Garantir que a tabela plural seja a padrão
-- Se existir uma tabela "Category", o ideal é migrar os dados, 
-- mas por hora vamos garantir que a "categories" seja editável.

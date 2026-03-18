-- Nova política RLS para que Administradores e Editores possam ver todos os registros de leitura, sem limitação do auth.uid()
CREATE POLICY "Allow staff select all article_reads" ON "public"."article_reads"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (auth.uid())::text
    AND profiles.role IN ('ADMIN', 'EDITOR')
  )
);

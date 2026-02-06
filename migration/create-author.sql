-- SQL para criar autor padrão e obter IDs para migração

-- 1. Criar autor padrão (substitua 'SEU_CLERK_USER_ID' pelo seu ID do Clerk)
-- Para pegar seu Clerk User ID: faça login e execute no console: await window.Clerk.user.id

INSERT INTO profiles (id, name, role)
VALUES (
  'SEU_CLERK_USER_ID',  -- Substitua pelo seu Clerk User ID
  'Redação Facebrasil',
  'EDITOR'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Buscar todos os IDs necessários para a migração
SELECT 
  'DEFAULT_AUTHOR_ID=' || (SELECT id FROM profiles LIMIT 1) as author_id,
  'DEFAULT_BLOG_ID=' || (SELECT id FROM blogs LIMIT 1) as blog_id,
  'DEFAULT_CATEGORY_ID=' || (SELECT id FROM categories LIMIT 1) as category_id;

-- 3. Copie os 3 valores retornados e cole no arquivo migration/.env

-- ALTERNATIVA: Se você já tem um usuário no Clerk, apenas busque os IDs:
-- SELECT id, name, role FROM profiles;
-- SELECT id, name FROM blogs;
-- SELECT id, name, slug FROM categories;

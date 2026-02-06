-- Execute este SQL no Supabase SQL Editor

-- 1. Buscar IDs necessários para a migração
SELECT 
  'DEFAULT_AUTHOR_ID=' || (SELECT id FROM profiles LIMIT 1) as author_id,
  'DEFAULT_BLOG_ID=' || (SELECT id FROM blogs LIMIT 1) as blog_id,
  'DEFAULT_CATEGORY_ID=' || (SELECT id FROM categories LIMIT 1) as category_id;

-- Se não houver nenhum profile, primeiro crie um:
-- (Substitua 'SEU_CLERK_USER_ID' pelo seu ID do Clerk)
/*
INSERT INTO profiles (id, name, role)
VALUES ('SEU_CLERK_USER_ID', 'Redação Facebrasil', 'EDITOR');
*/

-- Copie os 3 valores retornados e cole no arquivo migration/.env

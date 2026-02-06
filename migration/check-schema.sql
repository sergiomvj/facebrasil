-- Execute este SQL para ver a estrutura real das tabelas
-- Isso vai nos mostrar quais tabelas existem e como estão estruturadas

-- 1. Listar todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Ver estrutura da tabela articles (para entender o author_id)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'articles'
ORDER BY ordinal_position;

-- 3. Ver se existe tabela de profiles/users/authors
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%user%' OR table_name LIKE '%author%' OR table_name LIKE '%profile%')
ORDER BY table_name;

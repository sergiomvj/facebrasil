-- Análise de Categorias Importadas

-- 1. Ver as 30 categorias mais usadas
SELECT 
  c.name,
  c.slug,
  COUNT(a.id) as article_count
FROM categories c
LEFT JOIN articles a ON a.category_id = c.id
GROUP BY c.id, c.name, c.slug
ORDER BY article_count DESC
LIMIT 30;

-- 2. Ver categorias sem artigos (podem ser deletadas)
SELECT 
  c.name,
  c.slug
FROM categories c
LEFT JOIN articles a ON a.category_id = c.id
WHERE a.id IS NULL
ORDER BY c.name;

-- 3. Total de categorias
SELECT COUNT(*) as total_categories FROM categories;

-- 4. Sugestão: Consolidar categorias similares
-- Exemplo: mesclar "Aconteceu", "aconteceu", "ACONTECEU" em uma só
-- Execute depois de decidir quais mesclar:
/*
UPDATE articles 
SET category_id = 'ID_CATEGORIA_PRINCIPAL'
WHERE category_id IN ('ID_CAT_1', 'ID_CAT_2', 'ID_CAT_3');

DELETE FROM categories 
WHERE id IN ('ID_CAT_1', 'ID_CAT_2', 'ID_CAT_3');
*/

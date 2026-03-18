-- Adiciona a nova flag seo_applied indicando se a IA aplicou o SEO no texto (default false).
ALTER TABLE articles ADD COLUMN IF NOT EXISTS seo_applied boolean DEFAULT false;

-- Marca artigos antigos como true para não deixá-los pendentes.
UPDATE articles SET seo_applied = true WHERE seo_applied = false;
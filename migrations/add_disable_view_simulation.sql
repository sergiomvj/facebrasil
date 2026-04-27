-- ============================================================
-- Migration: add disable_view_simulation field to articles
-- Purpose: Allow disabling the automate-analytics view
--          increment script for specific articles
-- Date: 2026-04-27
-- ============================================================

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS disable_view_simulation BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN articles.disable_view_simulation IS
  'When TRUE, the automate-analytics Edge Function will skip incrementing views for this article.';

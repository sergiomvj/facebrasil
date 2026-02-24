-- Add parent_id to Category table for hierarchy support

ALTER TABLE "Category" 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES "Category"(id) ON DELETE SET NULL;

-- Create an index for better performance on tree queries
CREATE INDEX IF NOT EXISTS idx_Category_parent_id ON "Category"(parent_id);

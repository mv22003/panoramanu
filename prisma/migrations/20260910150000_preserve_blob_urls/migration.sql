ALTER TABLE "photos"
  ADD COLUMN IF NOT EXISTS "blob_image_url" TEXT,
  ADD COLUMN IF NOT EXISTS "blob_slideshow_image_url" TEXT;

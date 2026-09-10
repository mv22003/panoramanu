CREATE TABLE IF NOT EXISTS "photos" (
  "id" UUID PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "image_url" TEXT NOT NULL,
  "slideshow_image_url" TEXT NOT NULL DEFAULT '',
  "instagram_url" TEXT NOT NULL DEFAULT '',
  "location_name" TEXT NOT NULL,
  "country_name" TEXT NOT NULL DEFAULT '',
  "taken_on" DATE,
  "lat" DOUBLE PRECISION NOT NULL,
  "lng" DOUBLE PRECISION NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "photos_created_at_idx" ON "photos" ("created_at" DESC);

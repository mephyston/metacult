ALTER TABLE "medias" ADD COLUMN "slug" text;

DO $$ 
BEGIN 
    -- Backfill existing rows with a slug generated from the title
    -- Simple slugify: lowercase, replace non-alphanumeric with hyphen
    UPDATE "medias" 
    SET "slug" = lower(
        regexp_replace(
            regexp_replace("title", '[^a-zA-Z0-9\s]', '', 'g'), -- Remove special chars
            '\s+', '-', 'g' -- Replace spaces with hyphens
        )
    )
    WHERE "slug" IS NULL;

    -- Handle empty slugs if title was only special chars (fallback to uuid)
    UPDATE "medias" SET "slug" = "id" WHERE "slug" IS NULL OR "slug" = '';
END $$;

ALTER TABLE "medias" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "medias" ADD CONSTRAINT "medias_slug_unique" UNIQUE("slug");
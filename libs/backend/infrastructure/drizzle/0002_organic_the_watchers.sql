ALTER TABLE "user_media_affinity" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_similarity" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_similarity" ALTER COLUMN "neighbor_id" SET DATA TYPE text;
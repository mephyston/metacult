ALTER TABLE "medias" ADD COLUMN "elo_score" integer DEFAULT 1500 NOT NULL;--> statement-breakpoint
ALTER TABLE "medias" ADD COLUMN "match_count" integer DEFAULT 0 NOT NULL;
CREATE TABLE "interaction"."user_follows" (
	"follower_id" text NOT NULL,
	"following_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE UNIQUE INDEX "user_follows_pk" ON "interaction"."user_follows" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE INDEX "follower_idx" ON "interaction"."user_follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "following_idx" ON "interaction"."user_follows" USING btree ("following_id");--> statement-breakpoint
DROP INDEX IF EXISTS "interaction"."media_idx";--> statement-breakpoint
CREATE INDEX "media_idx" ON "interaction"."user_interactions" USING btree ("media_id");
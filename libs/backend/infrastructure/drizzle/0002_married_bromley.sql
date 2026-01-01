CREATE SCHEMA "interaction";
--> statement-breakpoint
CREATE TYPE "interaction"."action" AS ENUM('LIKE', 'DISLIKE', 'WISHLIST', 'SKIP');--> statement-breakpoint
CREATE TYPE "interaction"."sentiment" AS ENUM('BANGER', 'GOOD', 'OKAY');--> statement-breakpoint
CREATE TABLE "interaction"."user_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"media_id" uuid NOT NULL,
	"action" "interaction"."action" NOT NULL,
	"sentiment" "interaction"."sentiment",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "user_media_unique_idx" ON "interaction"."user_interactions" USING btree ("user_id","media_id");--> statement-breakpoint
CREATE UNIQUE INDEX "media_idx" ON "interaction"."user_interactions" USING btree ("media_id");
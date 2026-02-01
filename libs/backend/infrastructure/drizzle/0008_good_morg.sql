CREATE TYPE "public"."offer_category" AS ENUM('game', 'movie', 'show', 'book');--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "category" "offer_category" NOT NULL;--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "is_affiliated" boolean DEFAULT false NOT NULL;
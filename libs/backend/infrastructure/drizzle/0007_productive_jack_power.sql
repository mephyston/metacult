CREATE TYPE "public"."offer_type" AS ENUM('subscription', 'purchase', 'rent');--> statement-breakpoint
CREATE TABLE "offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"type" "offer_type" NOT NULL,
	"price" numeric(10, 2),
	"currency" text DEFAULT 'EUR' NOT NULL,
	"url" text NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_offers_media_id" ON "offers" USING btree ("media_id");
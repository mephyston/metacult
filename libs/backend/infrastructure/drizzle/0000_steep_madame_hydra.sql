CREATE SCHEMA "identity";
--> statement-breakpoint
CREATE SCHEMA "interaction";
--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('GAME', 'MOVIE', 'TV', 'BOOK');--> statement-breakpoint
CREATE TYPE "interaction"."action" AS ENUM('LIKE', 'DISLIKE', 'WISHLIST', 'SKIP');--> statement-breakpoint
CREATE TYPE "interaction"."sentiment" AS ENUM('BANGER', 'GOOD', 'OKAY');--> statement-breakpoint
CREATE TABLE "books" (
	"id" uuid PRIMARY KEY NOT NULL,
	"author" text,
	"pages" integer
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY NOT NULL,
	"platform" json DEFAULT '[]'::json,
	"developer" text,
	"time_to_beat" integer
);
--> statement-breakpoint
CREATE TABLE "medias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "media_type" NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"release_date" timestamp,
	"global_rating" real,
	"provider_metadata" jsonb,
	"elo_score" integer DEFAULT 1500 NOT NULL,
	"match_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "medias_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "medias_to_tags" (
	"media_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movies" (
	"id" uuid PRIMARY KEY NOT NULL,
	"director" text,
	"duration_minutes" integer
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"category" text NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tv" (
	"id" uuid PRIMARY KEY NOT NULL,
	"creator" text,
	"episodes_count" integer,
	"seasons_count" integer
);
--> statement-breakpoint
CREATE TABLE "identity"."account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity"."session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "identity"."user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "identity"."verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
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
ALTER TABLE "books" ADD CONSTRAINT "books_id_medias_id_fk" FOREIGN KEY ("id") REFERENCES "public"."medias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_id_medias_id_fk" FOREIGN KEY ("id") REFERENCES "public"."medias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medias_to_tags" ADD CONSTRAINT "medias_to_tags_media_id_medias_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."medias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medias_to_tags" ADD CONSTRAINT "medias_to_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movies" ADD CONSTRAINT "movies_id_medias_id_fk" FOREIGN KEY ("id") REFERENCES "public"."medias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tv" ADD CONSTRAINT "tv_id_medias_id_fk" FOREIGN KEY ("id") REFERENCES "public"."medias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_media_unique_idx" ON "interaction"."user_interactions" USING btree ("user_id","media_id");--> statement-breakpoint
CREATE UNIQUE INDEX "media_idx" ON "interaction"."user_interactions" USING btree ("media_id");
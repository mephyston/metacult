CREATE TABLE "user_media_affinity" (
	"user_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"score" integer DEFAULT 1200 NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_media_affinity_user_id_media_id_pk" PRIMARY KEY("user_id","media_id")
);
--> statement-breakpoint
CREATE TABLE "user_similarity" (
	"user_id" uuid NOT NULL,
	"neighbor_id" uuid NOT NULL,
	"similarity_score" real NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_similarity_user_id_neighbor_id_pk" PRIMARY KEY("user_id","neighbor_id")
);
--> statement-breakpoint
CREATE INDEX "idx_user_similarity_user_id" ON "user_similarity" USING btree ("user_id");
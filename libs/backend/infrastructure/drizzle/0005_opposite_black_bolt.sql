ALTER TABLE "identity"."user" ADD COLUMN "onboarding_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_medias_type" ON "medias" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_medias_release_date" ON "medias" USING btree ("release_date");--> statement-breakpoint
CREATE INDEX "idx_medias_elo_score" ON "medias" USING btree ("elo_score");--> statement-breakpoint
CREATE INDEX "idx_medias_created_at" ON "medias" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_medias_type_elo" ON "medias" USING btree ("type","elo_score");--> statement-breakpoint
CREATE INDEX "idx_affinity_score" ON "user_media_affinity" USING btree ("score");--> statement-breakpoint
CREATE INDEX "idx_affinity_media_id" ON "user_media_affinity" USING btree ("media_id");--> statement-breakpoint
CREATE INDEX "idx_user_similarity_score" ON "user_similarity" USING btree ("similarity_score");--> statement-breakpoint
CREATE INDEX "idx_user_stats_xp" ON "gamification"."user_stats" USING btree ("xp");--> statement-breakpoint
CREATE INDEX "idx_account_user_id" ON "identity"."account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_session_user_id" ON "identity"."session" USING btree ("user_id");
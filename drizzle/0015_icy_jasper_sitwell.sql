DROP INDEX "diagram_unique_idx";--> statement-breakpoint
DROP INDEX "scorecard_unique_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "diagram_unique_idx" ON "repository_diagrams" USING btree ("userId","repo_owner","repo_name","ref","diagram_type");--> statement-breakpoint
CREATE UNIQUE INDEX "scorecard_unique_idx" ON "repository_scorecards" USING btree ("userId","repo_owner","repo_name","ref");--> statement-breakpoint
ALTER TABLE "repository_diagrams" DROP COLUMN "version";--> statement-breakpoint
ALTER TABLE "repository_scorecards" DROP COLUMN "version";
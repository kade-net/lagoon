ALTER TABLE "follow" DROP CONSTRAINT "follow_follower_id_account_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "follow" ADD CONSTRAINT "follow_follower_id_account_id_fk" FOREIGN KEY ("follower_id") REFERENCES "account"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

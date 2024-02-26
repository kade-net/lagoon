CREATE TABLE IF NOT EXISTS "username" (
	"username" text PRIMARY KEY NOT NULL,
	"owner_address" text NOT NULL,
	"token_address" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profile" (
	"creator" integer PRIMARY KEY NOT NULL,
	"pfp" text,
	"bio" text,
	"display_name" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile" ADD CONSTRAINT "profile_creator_account_id_fk" FOREIGN KEY ("creator") REFERENCES "account"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

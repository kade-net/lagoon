CREATE TABLE IF NOT EXISTS "account" (
	"id" integer PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"object_address" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "follow" (
	"id" integer PRIMARY KEY NOT NULL,
	"follower_id" integer NOT NULL,
	"following_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comment" (
	"id" integer PRIMARY KEY NOT NULL,
	"publication_id" integer,
	"comment_id" integer,
	"creator_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"content" json NOT NULL,
	"quote_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "publication" (
	"id" integer PRIMARY KEY NOT NULL,
	"content" json NOT NULL,
	"creator_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quote" (
	"id" integer PRIMARY KEY NOT NULL,
	"publication_id" integer NOT NULL,
	"creator_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"content" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "repost" (
	"id" integer PRIMARY KEY NOT NULL,
	"publication_id" integer NOT NULL,
	"creator_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reaction" (
	"id" integer PRIMARY KEY NOT NULL,
	"publication_id" integer,
	"comment_id" integer,
	"quote_id" integer,
	"creator_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"reaction" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "delegate" (
	"id" integer PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"owner_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
 ALTER TABLE "follow" ADD CONSTRAINT "follow_follower_id_account_id_fk" FOREIGN KEY ("follower_id") REFERENCES "account"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "follow" ADD CONSTRAINT "follow_following_id_account_id_fk" FOREIGN KEY ("following_id") REFERENCES "account"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comment" ADD CONSTRAINT "comment_publication_id_publication_id_fk" FOREIGN KEY ("publication_id") REFERENCES "publication"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comment" ADD CONSTRAINT "comment_creator_id_account_id_fk" FOREIGN KEY ("creator_id") REFERENCES "account"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comment" ADD CONSTRAINT "comment_quote_id_quote_id_fk" FOREIGN KEY ("quote_id") REFERENCES "quote"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publication" ADD CONSTRAINT "publication_creator_id_account_id_fk" FOREIGN KEY ("creator_id") REFERENCES "account"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quote" ADD CONSTRAINT "quote_publication_id_publication_id_fk" FOREIGN KEY ("publication_id") REFERENCES "publication"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quote" ADD CONSTRAINT "quote_creator_id_account_id_fk" FOREIGN KEY ("creator_id") REFERENCES "account"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "repost" ADD CONSTRAINT "repost_publication_id_publication_id_fk" FOREIGN KEY ("publication_id") REFERENCES "publication"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "repost" ADD CONSTRAINT "repost_creator_id_account_id_fk" FOREIGN KEY ("creator_id") REFERENCES "account"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reaction" ADD CONSTRAINT "reaction_publication_id_publication_id_fk" FOREIGN KEY ("publication_id") REFERENCES "publication"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reaction" ADD CONSTRAINT "reaction_comment_id_comment_id_fk" FOREIGN KEY ("comment_id") REFERENCES "comment"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reaction" ADD CONSTRAINT "reaction_quote_id_quote_id_fk" FOREIGN KEY ("quote_id") REFERENCES "quote"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reaction" ADD CONSTRAINT "reaction_creator_id_account_id_fk" FOREIGN KEY ("creator_id") REFERENCES "account"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "delegate" ADD CONSTRAINT "delegate_owner_id_account_id_fk" FOREIGN KEY ("owner_id") REFERENCES "account"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile" ADD CONSTRAINT "profile_creator_account_id_fk" FOREIGN KEY ("creator") REFERENCES "account"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

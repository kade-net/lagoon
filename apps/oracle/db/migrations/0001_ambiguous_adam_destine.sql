ALTER TABLE "account" ADD COLUMN "signature" text NOT NULL;--> statement-breakpoint
ALTER TABLE "follow" ADD COLUMN "signature" text NOT NULL;--> statement-breakpoint
ALTER TABLE "comment" ADD COLUMN "signature" text NOT NULL;--> statement-breakpoint
ALTER TABLE "publication" ADD COLUMN "signature" text NOT NULL;--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "signature" text NOT NULL;--> statement-breakpoint
ALTER TABLE "repost" ADD COLUMN "signature" text NOT NULL;--> statement-breakpoint
ALTER TABLE "reaction" ADD COLUMN "signature" text NOT NULL;--> statement-breakpoint
ALTER TABLE "delegate" ADD COLUMN "signature" text NOT NULL;--> statement-breakpoint
ALTER TABLE "username" ADD COLUMN "signature" text NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "signature" text NOT NULL;
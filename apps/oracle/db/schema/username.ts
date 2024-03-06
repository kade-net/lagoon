import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { account } from "./account";

export const username = pgTable("username", {
    username: text("username").notNull().primaryKey(),
    owner_address: text("owner_address").notNull(),
    token_address: text("token_address").notNull(),
    timestamp: timestamp("timestamp").defaultNow().notNull()
})

export type USERNAME = typeof username.$inferSelect

export type USERNAME_CREATE = typeof username.$inferInsert


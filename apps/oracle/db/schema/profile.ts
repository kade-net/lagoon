import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { account } from "./account";
import { relations } from "drizzle-orm";

export const profile = pgTable("profile", {
    creator: integer("creator").notNull().primaryKey().references(() => account.id),
    pfp: text("pfp"),
    bio: text("bio"),
    display_name: text("display_name"),
})

export const profile_relations = relations(profile, ({ one, many }) => {
    return {
        creator: one(account, {
            relationName: "creator",
            fields: [profile.creator],
            references: [account.id]
        }),
    }
})

export type PROFILE = typeof profile.$inferSelect

export type PROFILE_CREATE = typeof profile.$inferInsert
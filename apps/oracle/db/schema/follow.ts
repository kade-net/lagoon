import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { account } from "./account";
import { relations } from "drizzle-orm";


export const follow = pgTable("follow", {
    id: integer("id").notNull().primaryKey(),
    follower_id: integer("follower_id").notNull().references(()=> account.id),
    following_id: integer("following_id").notNull().references(() => account.id),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
})

export type FOLLOW = typeof follow.$inferSelect
export type FOLLOW_CREATE = typeof follow.$inferInsert

export const follow_relations = relations(follow, ({one, many})=>{
    return {
        follower: one(account, {
            relationName: "follower",
            fields: [follow.follower_id],
            references: [account.id]
        }),
        following: one(account, {
            relationName: "following",
            fields: [follow.following_id],
            references: [account.id]
        }),
    }
})
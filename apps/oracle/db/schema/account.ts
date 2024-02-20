import { relations } from "drizzle-orm";
import { pgTable, integer, text, timestamp } from "drizzle-orm/pg-core";
import { follow } from "./follow";
import { delegate } from "./delegate";


export const account = pgTable("account", {
    id: integer("id").notNull().primaryKey(), // resolution of the account can happen at render time 
    bio: text("bio").notNull(),
    username: text("username").notNull(),
    address: text("address").notNull(),
    object_address: text("object_address").notNull(),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
})


export type ACCOUNT = typeof account.$inferSelect
export type ACCOUNT_CREATE = typeof account.$inferInsert


export const account_relations = relations(account, ({one, many})=> {
    return {
        followers: many(follow, {
            relationName: "followers"
        }),
        following: many(follow, {
            relationName: "following"
        }),
        delegates: many(delegate, {
            relationName: "delegates"
        })
    }
})


import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { account } from "./account";
import { relations } from "drizzle-orm";


export const delegate = pgTable("delegate", {
    id: integer("id").notNull().primaryKey(),
    address: text("address").notNull(),
    owner_id: integer("owner_id").notNull().references(()=> account.id),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
    signature: text("signature").notNull(),
})


export type DELEGATE = typeof delegate.$inferSelect

export type DELEGATE_CREATE = typeof delegate.$inferInsert

export const delegate_relations = relations(delegate, ({one, many})=>{
    return {
        owner: one(account, {
            relationName: "owner",
            fields: [delegate.owner_id],
            references: [account.id]
        }),
    }
})
import { AnyPgColumn, integer, json, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { account } from "./account";
import { relations } from "drizzle-orm";



export const publication = pgTable("publication",{
    id: integer("id").notNull().primaryKey(),
    content: json("content").notNull(),
    creator_id: integer("creator_id").notNull().references(()=>account.id),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    type: integer("type").notNull().default(1),
    parent_id: integer("parent_id").references((): AnyPgColumn => publication.id),
    publication_ref: text("publication_ref"),
})

export type PUBLICATION = typeof publication.$inferSelect
export type PUBLICATION_CREATE = typeof publication.$inferInsert

export const publication_relations = relations(publication, ({one, many})=>{
    return {
        creator: one(account, {
            relationName: "creator",
            fields: [publication.creator_id],
            references: [account.id]
        }),
        publication: one(publication, {
            relationName: "publication",
            fields: [publication.parent_id],
            references: [publication.id]
        })
    }
})

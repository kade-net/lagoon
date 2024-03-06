import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { publication } from "./publication";
import { relations } from "drizzle-orm";
import { account } from "./account";




export const reaction = pgTable("reaction", {
    id: integer("id").notNull().primaryKey(),
    publication_id: integer("publication_id").references(() => publication.id),
    creator_id: integer("creator_id").notNull().references(()=> account.id),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    reaction: integer("reaction").notNull(),
})

export type REACTION = typeof reaction.$inferSelect
export type REACTION_CREATE = typeof reaction.$inferInsert


export const reaction_relations = relations(reaction, ({one, many})=>{
    return {
        publication: one(publication, {
            relationName: "publication",
            fields: [reaction.publication_id],
            references: [publication.id]
        }),
        creator: one(account, {
            relationName: "creator",
            fields: [reaction.creator_id],
            references: [account.id]
        }),
    }
})


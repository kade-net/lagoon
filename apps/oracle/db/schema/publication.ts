import { integer, json, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { account } from "./account";
import { relations } from "drizzle-orm";



export const publication = pgTable("publication",{
    id: integer("id").notNull().primaryKey(),
    content: json("content").notNull(),
    creator_id: integer("creator_id").notNull().references(()=>account.id),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    signature: text("signature").notNull(),
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
        reposts: many(repost, {
            relationName: "reposts"
        }),
        quotes: many(quote, {
            relationName: "quotes"
        }),
        comments: many(comment, {
            relationName: "comments"
        }),
    }
})

export const repost = pgTable("repost",{
    id: integer("id").notNull().primaryKey(),
    publication_id: integer("publication_id").notNull().references(()=> publication.id),
    creator_id: integer("creator_id").notNull().references(()=> account.id),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    signature: text("signature").notNull(),
})

export type REPOST = typeof repost.$inferSelect
export type REPOST_CREATE = typeof repost.$inferInsert

export const repost_relations = relations(repost, ({one, many})=>{
    return {
        creator: one(account, {
            relationName: "creator",
            fields: [repost.creator_id],
            references: [account.id]
        }),
        publication: one(publication, {
            relationName: "publication",
            fields: [repost.publication_id],
            references: [publication.id]
        }),
    }
})

export const quote = pgTable("quote",{
    id: integer("id").notNull().primaryKey(),
    publication_id: integer("publication_id").notNull().references(()=> publication.id),
    creator_id: integer("creator_id").notNull().references(()=> account.id),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    content: json("content").notNull(),
    signature: text("signature").notNull(),
})

export type QUOTE = typeof quote.$inferSelect
export type QUOTE_CREATE = typeof quote.$inferInsert

export const quote_relations = relations(quote, ({one, many})=>{
    return {
        creator: one(account, {
            relationName: "creator",
            fields: [quote.creator_id],
            references: [account.id]
        }),
        publication: one(publication, {
            relationName: "publication",
            fields: [quote.publication_id],
            references: [publication.id]
        }),
        comments: many(comment, {
            relationName: "comments"
        }),
    }
})

export const comment = pgTable("comment",{
    id: integer("id").notNull().primaryKey(),
    publication_id: integer("publication_id").references(()=> publication.id),
    comment_id: integer("comment_id"),
    creator_id: integer("creator_id").notNull().references(()=> account.id),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    content: json("content").notNull(),
    quote_id: integer("quote_id").references(()=> quote.id),
    signature: text("signature").notNull(),
})

export type COMMENT = typeof comment.$inferSelect
export type COMMENT_CREATE = typeof comment.$inferInsert

export const comment_relations = relations(comment, ({one, many})=>{
    return {
        creator: one(account, {
            relationName: "creator",
            fields: [comment.creator_id],
            references: [account.id]
        }),
        publication: one(publication, {
            relationName: "publication",
            fields: [comment.publication_id],
            references: [publication.id]
        }),
        comment: one(comment, {
            relationName: "comment",
            fields: [comment.comment_id],
            references: [comment.id]
        }),
        comments: many(comment, {
            relationName: "comments"
        }),
        quote: one(quote, {
            relationName: "quote",
            fields: [comment.quote_id],
            references: [quote.id]
        }),
    }
})
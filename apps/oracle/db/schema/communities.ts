import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { account } from "./account";
import { publication } from "./publication";
import { relations } from "drizzle-orm";


export const communities = pgTable("communities", {
    id: integer("id").notNull().primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description").notNull(),
    image: text("image").notNull(),
    creator_address: text("creator_address").notNull(),
    user_kid: integer("user_kid").notNull().references(() => account.id),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
})

export const community_relations = relations(communities, ({ one, many }) => {
    return {
        creator: one(account, {
            fields: [communities.user_kid],
            references: [account.id]
        }),
        memberships: many(membership)
    }
})

export type COMMUNITY = typeof communities.$inferSelect


export const membership = pgTable("membership", {
    id: integer("id").notNull().primaryKey(),
    community_id: integer("community_id").notNull().references(() => communities.id),
    user_kid: integer("user_kid").notNull().references(() => account.id),
    timestamp: timestamp("timestamp").defaultNow(),
    type: integer("type").notNull(),
    is_active: boolean("is_active").notNull().default(true),
})

export const membership_relations = relations(membership, ({ one, many }) => {
    return {
        community: one(communities, {
            fields: [membership.community_id],
            references: [communities.id]
        }),
        user: one(account, {
            fields: [membership.user_kid],
            references: [account.id]
        })
    }
})

export type MEMBERSHIP = typeof membership.$inferSelect


export const community_posts = pgTable("community_posts", {
    id: text("id").notNull().primaryKey(),
    community_id: integer("community_id").notNull().references(() => communities.id),
    user_kid: integer("user_kid").notNull().references(() => account.id),
    post_id: integer("post_id").notNull().references(() => publication.id),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
})

export type COMMUNITY_POST = typeof community_posts.$inferSelect

export const community_posts_relations = relations(community_posts, ({ one, many }) => {
    return {
        community: one(communities, {
            fields: [community_posts.community_id],
            references: [communities.id]
        }),
        user: one(account, {
            fields: [community_posts.user_kid],
            references: [account.id]
        }),
        post: one(publication, {
            fields: [community_posts.post_id],
            references: [publication.id]
        })
    }
})








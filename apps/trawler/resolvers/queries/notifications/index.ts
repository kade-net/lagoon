import { account, aliasedTable, and, desc, eq, follow, ne, publication, reaction, sql } from "@kade-net/oracle"
import { union, unionAll } from "@kade-net/oracle/pg-core"
import { Context, PaginationArg, Resolver, SORT_ORDER } from "../../../types"

type NotificationType = {
    timestamp: Date;
    type: never;
    referenceUserId: number;
    referenceDataId: number;
}


interface ResolverMap {
    Query: {
        userNotifications: Resolver<any, PaginationArg & { sort: SORT_ORDER, accountAddress: string }, Context>
    },
    Notification: {
        referenceUser: Resolver<NotificationType, any, Context>,
        publication: Resolver<NotificationType, any, Context>,
        follow: Resolver<NotificationType, any, Context>,
        reaction: Resolver<NotificationType, any, Context>
    }
}


export const NotificationsResolver: ResolverMap = {
    Query: {
        userNotifications: async (_, args, context) => {
            const { accountAddress, pagination, sort } = args
            const { page = 0, size = 10 } = pagination ?? {}

            const _account = await context.oracle.query.account.findFirst({
                where: (fields, { eq }) => eq(fields.address, accountAddress)
            })


            if (!_account) {
                throw new Error("Account not found")
            }

            const followQuery = context.oracle.select({
                referenceUserId: follow.follower_id,
                type: sql<number>`1`.mapWith(Number).as('type'),
                timestamp: follow.timestamp,
                referenceDataId: follow.id,
            })
                .from(follow)
                .innerJoin(account, eq(account.id, follow.following_id))
                .where(eq(follow.following_id, _account.id))

            const parentPublication = aliasedTable(publication, "parentPublication")

            const publicationQuery = context.oracle.select({
                referenceUserId: publication.creator_id,
                type: sql<number>`'2'`.mapWith(Number).as('type'),
                timestamp: publication.timestamp,
                referenceDataId: publication.id
            })
                .from(publication)
                .innerJoin(parentPublication, eq(parentPublication.id, publication.parent_id))
                .where(and(
                    eq(parentPublication.creator_id, _account.id),
                    ne(publication.creator_id, _account.id)
                ))

            const reactionsQuery = context.oracle.select({
                referenceUserId: reaction.creator_id,
                type: sql<number>`'3'`.mapWith(Number).as('type'),
                timestamp: reaction.timestamp,
                referenceDataId: reaction.id
            })
                .from(reaction)
                .innerJoin(publication, eq(reaction.publication_id, publication.id))
                .where(and(
                    eq(publication.creator_id, _account.id),
                    ne(reaction.creator_id, _account.id)
                ))


            const allDataSubQuery = unionAll(followQuery, publicationQuery, reactionsQuery)

            const sub = allDataSubQuery.as("allDataSubQuery")

            const allData = await context.oracle.select().from(allDataSubQuery.as("allDataSubQuery"))
                .orderBy(desc(sub.timestamp))
                .limit(size)
                .offset(page * size)

            return allData
        }
    },
    Notification: {
        follow: async (parent, _, context) => {
            if (parent.type !== 1) return null
            return await context.oracle.query.follow.findFirst({
                where: (fields, { eq }) => eq(fields.id, parent.referenceDataId)
            })
        },
        publication: async (parent, _, context) => {
            if (parent.type !== 2) return null
            return await context.oracle.query.publication.findFirst({
                where: (fields, { eq }) => eq(fields.id, parent.referenceDataId)
            })
        },
        referenceUser: async (parent, _, context) => {
            return await context.oracle.query.account.findFirst({
                where: (fields, { eq }) => eq(fields.id, parent.referenceUserId)
            })
        },
        reaction: async (parent, _, context) => {
            if (parent.type !== 3) return null
            return await context.oracle.query.reaction.findFirst({
                where: (fields, { eq }) => eq(fields.id, parent.referenceDataId)
            })
        }
    }
}
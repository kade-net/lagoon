import { account, aliasedTable, desc, eq, follow, publication, sql } from "@kade-net/oracle"
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
        follow: Resolver<NotificationType, any, Context>
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
                .where(eq(parentPublication.creator_id, _account.id))

            const allDataSubQuery = unionAll(followQuery, publicationQuery)

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
        }
    }
}
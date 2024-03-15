import { Context, Pagination, PaginationArg, Resolver, SORT_ORDER } from "../../../types";
import _ from "lodash"
import { ACCOUNT, account, and, asc, count, delegate, desc, eq, follow, like, publication, reaction, username } from "oracle";
const { isUndefined } = _

interface ResolverMap {
    Query: {
        account: Resolver<any, {id?: number, address?: string}, Context>,
        accounts: Resolver<any, PaginationArg & { sort: SORT_ORDER, search?: string }, Context>
        accountViewerStats: Resolver<any, { accountAddress: string, viewerAddress: string }, Context>
        accountPublications: Resolver<any, PaginationArg & { sort: SORT_ORDER, type: number, accountAddress: string }, Context>
    },
    Account: {
        followers: Resolver<ACCOUNT, PaginationArg & {sort: SORT_ORDER}, Context>
        following: Resolver<ACCOUNT, PaginationArg & {sort: SORT_ORDER}, Context>
        publications: Resolver<ACCOUNT, PaginationArg & { sort: SORT_ORDER, type: number }, Context>
        delegates: Resolver<ACCOUNT, PaginationArg & { sort: SORT_ORDER }, Context>
        reactions: Resolver<ACCOUNT, PaginationArg & {sort: SORT_ORDER}, Context>
        stats: Resolver<ACCOUNT, any, Context>,
        profile: Resolver<ACCOUNT, any, Context>,
        username: Resolver<ACCOUNT, any, Context>,
        viewer: Resolver<ACCOUNT, { viewer: number }, Context>
    }
}

export const AccountsResolver: ResolverMap = {
    Query: {
        account: async (_, args, context: Context) => {
            if (isUndefined(args.id) && isUndefined(args.address)){
                return null
            }
            if (!isUndefined(args.id)){
                const account = await context.oracle.query.account.findFirst({
                    where: (fields, {eq}) => eq(fields.id, args.id as unknown as number)
                })

                return account
            }

            if (!isUndefined(args.address)){
                const account = await context.oracle.query.account.findFirst({
                    where: (fields, {eq}) => eq(fields.address, args.address as unknown as string)
                })
                return account
            }

        },
        accounts: async (_, args, context) => {
            const { size = 10, page = 0 } = args.pagination ?? {}

            if (args.search) {
                const a_n_u = await context.oracle.select()
                    .from(account)
                    .innerJoin(username, eq(account.address, username.owner_address))
                    .where(like(username.username, `%${args.search}%`))
                    .orderBy(args?.sort == "ASC" ? asc(account.timestamp) : desc(account.timestamp))
                    .limit(size)
                    .offset(page * size)

                return a_n_u?.map((a) => a.account)
            }

                return await context.oracle.query.account.findMany({
                    offset: page * size,
                    limit: size,
                    orderBy: args?.sort == "ASC" ? asc(account.timestamp) : desc(account.timestamp)
                })
        },
        accountViewerStats: async (_, args, context) => {
            const { accountAddress, viewerAddress } = args
            const account = await context.oracle.query.account.findFirst({
                where: (fields, { eq }) => eq(fields.address, accountAddress)
            })

            const viewer = await context.oracle.query.account.findFirst({
                where: (fields, { eq }) => eq(fields.address, viewerAddress)
            })

            if (!account || !viewer) {
                return null
            }

            const follows = await context.oracle.query.follow.findFirst({
                where: (fields, { and, eq }) => and(
                    eq(fields.follower_id, viewer.id),
                    eq(fields.following_id, account.id)
                )
            })

            const followed = await context.oracle.query.follow.findFirst({
                where: (fields, { and, eq }) => and(
                    eq(fields.follower_id, account.id),
                    eq(fields.following_id, viewer.id)
                )
            })

            return {
                follows: follows ? true : false,
                followed: followed ? true : false
            }
        },
        accountPublications: async (_, args, context) => {
            const { size = 10, page = 0 } = args.pagination ?? {}
            const { accountAddress, type } = args

            const account = await context.oracle.query.account.findFirst({
                where: (fields, { eq }) => eq(fields.address, accountAddress)
            })

            if (!account) {
                return null
            }

            return await context.oracle.query.publication.findMany({
                where: (fields, { eq }) => type ? and(
                    eq(fields.creator_id, account.id),
                    eq(fields.type, type)
                ) : eq(fields.creator_id, account.id),
                offset: page * size,
                limit: size,
                orderBy: args?.sort == "ASC" ? asc(publication.timestamp) : desc(publication.timestamp)
            })
        }
    },
    Account: {
        followers: async (parent, args, context) => {
            const { size = 10, page = 0 } = args.pagination ?? {}
            return await context.oracle.query.follow.findMany({
                where: (fields, {eq}) => eq(fields.following_id, parent.id),
                offset: page * size,
                limit: size,
                orderBy: args?.sort == "ASC" ? asc(follow.timestamp) : desc(follow.timestamp)
            })
        },
        following: async (parent, args, context) => {
            const { size = 10, page = 0 } = args.pagination ?? {}
            return await context.oracle.query.follow.findMany({
                where: (fields, {eq}) => eq(fields.follower_id, parent.id),
                offset: page * size,
                limit: size,
                orderBy: args?.sort == "ASC" ? asc(follow.timestamp) : desc(follow.timestamp)
            })
        },
        publications: async (parent, args, context) => {
            const { type } = args
            const { size = 10, page = 0 } = args.pagination ?? {}
            return await context.oracle.query.publication.findMany({
                where: (fields, { eq }) => type ? and(
                    eq(fields.creator_id, parent.id),
                    eq(fields.type, type)
                ) : eq(fields.creator_id, parent.id),
                offset: page * size,
                limit: size,
                orderBy: args?.sort == "ASC" ? asc(publication.timestamp) : desc(publication.timestamp)
            })
        },
        delegates: async (parent, args, context) => {
            const { size = 10, page = 0 } = args.pagination ?? {}
            return await context.oracle.query.delegate.findMany({
                where: (fields, {eq}) => eq(fields.owner_id, parent.id),
                offset: page * size,
                limit: size,
                orderBy: args?.sort == "ASC" ? asc(delegate.timestamp) : desc(delegate.timestamp)
            })
        },
        reactions: async (parent, args, context) => {
            const { size = 10, page = 0 } = args.pagination ?? {}
            return await context.oracle.query.reaction.findMany({
                where: (fields, {eq}) => eq(fields.creator_id, parent.id),
                offset: page * size,
                limit: size,
                orderBy: args?.sort == "ASC" ? asc(reaction.timestamp) : desc(reaction.timestamp)
            })
        },
        stats: async (parent, _, context) => {
            const followers_count = await context.oracle.select({
                value: count()
            }).from(follow).where(eq(follow.following_id, parent.id))

            const following_count = await context.oracle.select({
                value: count()
            }).from(follow).where(eq(follow.follower_id, parent.id))

            const post_count = await context.oracle.select({
                value: count()
            }).from(publication).where(and(
                eq(publication.creator_id, parent.id),
                eq(publication.type, 1)
            ))

            const delegates_count = await context.oracle.select({
                value: count()
            }).from(delegate).where(eq(delegate.owner_id, parent.id))

            const reposts_count = await context.oracle.select({
                value: count()
            }).from(publication).where(
                and(
                    eq(publication.parent_id, parent.id),
                    eq(publication.type, 4)
                )
            )

            const quotes_count = await context.oracle.select({
                value: count()
            }).from(publication).where(
                and(
                    eq(publication.parent_id, parent.id),
                    eq(publication.type, 2)
                )
            )

            const comments_count = await context.oracle.select({
                value: count()
            }).from(publication).where(
                and(
                    eq(publication.parent_id, parent.id),
                    eq(publication.type, 3)
                )
            )

            const reactions_count = await context.oracle.select({
                value: count()
            }).from(publication).where(eq(publication.creator_id, parent.id))

            return {
                followers: followers_count.at(0)?.value ?? 0,
                following: following_count.at(0)?.value ?? 0,
                posts: post_count.at(0)?.value ?? 0,
                delegates: delegates_count.at(0)?.value ?? 0,
                reposts: reposts_count.at(0)?.value ?? 0,
                quotes: quotes_count.at(0)?.value ?? 0,
                comments: comments_count.at(0)?.value ?? 0,
                reactions: reactions_count.at(0)?.value ?? 0
            }
        },
        profile: async (parent, _, context) => {
            return await context.oracle.query.profile.findFirst({
                where: (fields, { eq }) => eq(fields.creator, parent.id)
            })
        },
        username: async (parent, _, context) => {
            return await context.oracle.query.username.findFirst({
                where: (fields, { eq }) => eq(fields.owner_address, parent.address)
            })
        },
        viewer: async (parent, args, context) => {
            const { viewer } = args

            if (!viewer) {
                return null
            }

            const follows = await context.oracle.query.follow.findFirst({
                where: (fields, { and, eq }) => and(
                    eq(fields.follower_id, viewer),
                    eq(fields.following_id, parent.id)
                )
            })

            const followed = await context.oracle.query.follow.findFirst({
                where: (fields, { and, eq }) => and(
                    eq(fields.follower_id, parent.id),
                    eq(fields.following_id, viewer)
                )
            })

            return {
                follows: follows ? true : false,
                followed: followed ? true : false
            }
        }
    }
}
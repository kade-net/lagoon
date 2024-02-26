import { Context, Pagination, PaginationArg, Resolver, SORT_ORDER } from "../../../types";
import _ from "lodash"
import { ACCOUNT, account, asc, count, delegate, desc, eq, follow, publication, repost } from "oracle";
const { isUndefined } = _

interface ResolverMap {
    Query: {
        account: Resolver<any, {id?: number, address?: string}, Context>,
        accounts: Resolver<any, PaginationArg & {sort: SORT_ORDER}, Context>
    },
    Account: {
        followers: Resolver<ACCOUNT, PaginationArg & {sort: SORT_ORDER}, Context>
        following: Resolver<ACCOUNT, PaginationArg & {sort: SORT_ORDER}, Context>
        publications: Resolver<ACCOUNT, PaginationArg & {sort: SORT_ORDER}, Context>
        delegates: Resolver<ACCOUNT, PaginationArg & {sort: SORT_ORDER}, Context>
        reposts: Resolver<ACCOUNT, PaginationArg & {sort: SORT_ORDER}, Context>
        quotes: Resolver<ACCOUNT, PaginationArg & {sort: SORT_ORDER}, Context>
        comments: Resolver<ACCOUNT, PaginationArg & {sort: SORT_ORDER}, Context>
        reactions: Resolver<ACCOUNT, PaginationArg & {sort: SORT_ORDER}, Context>
        stats: Resolver<ACCOUNT, any, Context>,
        profile: Resolver<ACCOUNT, any, Context>,
        username: Resolver<ACCOUNT, any, Context>
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

                return await context.oracle.query.account.findMany({
                    offset: page * size,
                    limit: size,
                    orderBy: args?.sort == "ASC" ? asc(account.timestamp) : desc(account.timestamp)
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
            const { size = 10, page = 0 } = args.pagination ?? {}
            return await context.oracle.query.publication.findMany({
                where: (fields, {eq}) => eq(fields.creator_id, parent.id),
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
        reposts: async (parent, args, context) => {
            const { size = 10, page = 0 } = args.pagination ?? {}
            return await context.oracle.query.repost.findMany({
                where: (fields, {eq}) => eq(fields.creator_id, parent.id),
                offset: page * size,
                limit: size,
                orderBy: args?.sort == "ASC" ? asc(repost.timestamp) : desc(repost.timestamp)
            })
        },
        quotes: async (parent, args, context) => {
            const { size = 10, page = 0 } = args.pagination ?? {}
            return (await context.oracle.query.quote.findMany({
                where: (fields, {eq}) => eq(fields.creator_id, parent.id),
                offset: page * size,
                limit: size,
                orderBy: args?.sort == "ASC" ? asc(repost.timestamp) : desc(repost.timestamp)
            }))
        },
        comments: async (parent, args, context) => {
            const { size = 10, page = 0 } = args.pagination ?? {}
            return await context.oracle.query.comment.findMany({
                where: (fields, {eq}) => eq(fields.creator_id, parent.id),
                offset: page * size,
                limit: size,
                orderBy: args?.sort == "ASC" ? asc(repost.timestamp) : desc(repost.timestamp)
            })
        },
        reactions: async (parent, args, context) => {
            const { size = 10, page = 0 } = args.pagination ?? {}
            return await context.oracle.query.reaction.findMany({
                where: (fields, {eq}) => eq(fields.creator_id, parent.id),
                offset: page * size,
                limit: size,
                orderBy: args?.sort == "ASC" ? asc(repost.timestamp) : desc(repost.timestamp)
            })
        },
        stats: async (parent, _, context) => {
            const followers_count = await context.oracle.select({
                value: count()
            }).from(follow).where(eq(follow.following_id, parent.id))

            const following_count = await context.oracle.select({
                value: count()
            }).from(follow).where(eq(follow.follower_id, parent.id))

            const publications_count = await context.oracle.select({
                value: count()
            }).from(publication).where(eq(publication.creator_id, parent.id))

            const delegates_count = await context.oracle.select({
                value: count()
            }).from(delegate).where(eq(delegate.owner_id, parent.id))

            const reposts_count = await context.oracle.select({
                value: count()
            }).from(repost).where(eq(repost.creator_id, parent.id))

            const quotes_count = await context.oracle.select({
                value: count()
            }).from(publication).where(eq(publication.creator_id, parent.id))

            const comments_count = await context.oracle.select({
                value: count()
            }).from(publication).where(eq(publication.creator_id, parent.id))

            const reactions_count = await context.oracle.select({
                value: count()
            }).from(publication).where(eq(publication.creator_id, parent.id))

            return {
                followers: followers_count.at(0)?.value ?? 0,
                following: following_count.at(0)?.value ?? 0,
                publications: publications_count.at(0)?.value ?? 0,
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
        }
    }
}
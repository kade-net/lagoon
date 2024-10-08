import { Context, Pagination, PaginationArg, Resolver, SORT_ORDER } from "../../../types";
import _, { orderBy } from "lodash"
import { ACCOUNT, FOLLOW, account, and, asc, count, delegate, desc, eq, follow, ilike, like, ne, publication, reaction, sql, username } from "@kade-net/oracle";
import { intersect, union } from "@kade-net/oracle/pg-core";
const { isUndefined, isEmpty } = _

interface ResolverMap {
    Query: {
        account: Resolver<any, { id?: number, address?: string, username?: string }, Context>,
        accounts: Resolver<any, PaginationArg & { sort: SORT_ORDER, search?: string, byFollowing?: boolean }, Context>
        accountsSearch: Resolver<any, { search: string, userAddress: string }, Context>
        accountViewerStats: Resolver<any, { accountAddress: string, viewerAddress: string }, Context>
        accountPublications: Resolver<any, PaginationArg & { sort: SORT_ORDER, type: number, accountAddress: string }, Context>,
        followers: Resolver<any, PaginationArg & { accountAddress: string }, Context>,
        following: Resolver<any, PaginationArg & { accountAddress: string }, Context>,
        accountUserName: Resolver<any, { accountAddress: string }, Context>
        accountRelationship: Resolver<any, { viewerAddress: string, accountAddress: string }, Context>,
        accountStats: Resolver<any, { accountAddress: string }, Context>
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
        viewer: Resolver<ACCOUNT, { viewer: number, address: string }, Context>
    },
    Follow: {
        follower: Resolver<FOLLOW, any, Context>,
        following: Resolver<FOLLOW, any, Context>
    }
}

export const AccountsResolver: ResolverMap = {
    Query: {
        account: async (_, args, context: Context) => {
            if (args.username) {
                const response = await context.oracle.select()
                    .from(username)
                    .innerJoin(account, eq(account.address, username.owner_address))
                    .where(eq(username.username, args.username))
                    .limit(1)

                return response.at(0)?.account ?? null
            }
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
            const SORT_BY_FOLLOWING = args.byFollowing ?? false
            const { size = 10, page = 0, } = args.pagination ?? {}


            if (SORT_BY_FOLLOWING) {
                const result = await context.oracle.execute<ACCOUNT>(sql`
                    SELECT 
                        account.*,
                        COUNT(follow.id) AS follow_count
                    FROM 
                        account
                    LEFT JOIN 
                        follow ON account.id = follow.following_id
                    GROUP BY 
                        account.id
                    ORDER BY 
                        follow_count DESC
                    LIMIT ${size}
                    OFFSET ${page * size};
               `)

                const data = result?.map((r) => {
                    const { timestamp, ...rest } = r

                    return {
                        ...rest,
                        timestamp: new Date(timestamp)
                    }
                })

                return data ?? []

            }


            if (args.search) {
                const a_n_u = await context.oracle.select()
                    .from(account)
                    .innerJoin(username, eq(account.address, username.owner_address))
                    .where(ilike(username.username, `%${args.search}%`))
                    .orderBy(args?.sort == "ASC" ? asc(account.timestamp) : desc(account.timestamp))
                    .limit(size)
                    .offset(page * size)
                const c = a_n_u?.map((a) => a.account)
                return a_n_u?.map((a) => a.account)
            }

                return await context.oracle.query.account.findMany({
                    offset: page * size,
                    limit: size,
                    orderBy: args?.sort == "ASC" ? asc(account.timestamp) : desc(account.timestamp)
                })
        },
        accountsSearch: async (_, args, context) => {
            const a_n_u = await context.oracle.select()
                .from(account)
                .innerJoin(username, eq(account.address, username.owner_address))
                .where(and(
                    ilike(username.username, `%${args.search}%`),
                    ne(account.address, args.userAddress)
                ))
                .orderBy(desc(account.timestamp))
                .limit(5)
                .offset(0)

            return a_n_u?.map((a) => a.account)
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
        },
        followers: async (_, args, context) => {
            const { size = 20, page = 0 } = args.pagination ?? {}
            const { accountAddress } = args

            const account = await context.oracle.query.account.findFirst({
                where: (fields, { eq }) => eq(fields.address, accountAddress)
            })

            if (!account) {
                return null
            }

            const results = await context.oracle.query.follow.findMany({
                where: (fields, { eq }) => eq(fields.following_id, account.id),
                offset: page * size,
                limit: size,
                orderBy: desc(follow.timestamp),
                with: {
                    follower: true
                }
            })

            return results?.map((r) => r.follower)
        },
        following: async (_, args, context) => {
            const { size = 10, page = 0 } = args.pagination ?? {}
            const { accountAddress } = args

            const account = await context.oracle.query.account.findFirst({
                where: (fields, { eq }) => eq(fields.address, accountAddress)
            })

            if (!account) {
                return null
            }

            const results = await context.oracle.query.follow.findMany({
                where: (fields, { eq }) => eq(fields.follower_id, account.id),
                offset: page * size,
                limit: size,
                orderBy: desc(follow.timestamp),
                with: {
                    following: true
                }
            })

            return results?.map((r) => r.following)
        },
        accountUserName: async (_, { accountAddress }, context) => {
            if (isEmpty(accountAddress)) return null

            const username = await context.oracle.query.username.findFirst({
                where: (fields, { eq }) => eq(fields.owner_address, accountAddress)
            })

            return username ?? null
        },
        accountRelationship: async (_, { accountAddress, viewerAddress }, context) => {

            const response = await context.oracle.transaction(async (txn) => {
                const _mainAccount = await txn.query.account.findFirst({
                    where(fields, operators) {
                        return operators.eq(fields.address, accountAddress)
                    }
                })
                if (!_mainAccount) return null
                const _follow = await txn.select()
                    .from(follow)
                    .innerJoin(account, eq(account.id, follow.follower_id))
                    .where(and(
                        eq(account.address, viewerAddress),
                    eq(follow.following_id, _mainAccount.id)
                ))

                const _following = await txn.select()
                    .from(follow)
                    .innerJoin(account, eq(account.id, follow.following_id))
                    .where(
                        and(
                            eq(account.address, viewerAddress),
                            eq(follow.follower_id, _mainAccount.id)
                        )
                    )

                const viewer_follow = _follow?.at(0)?.follow
                const account_follow = _following?.at(0)?.follow

                return {
                    id: _mainAccount.id,
                    follows: viewer_follow ? true : false,
                    followed: account_follow ? true : false
                }
            })


            return response

        },
        accountStats: async (_, { accountAddress }, context) => {
            if (!accountAddress) return null
            const parent = await context.oracle.query.account.findFirst({
                where(fields, operators) {
                    return operators.eq(fields.address, accountAddress)
                }
            })

            if (!parent) return null

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
                reactions: reactions_count.at(0)?.value ?? 0,
                id: parent.id
            }
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
                reactions: reactions_count.at(0)?.value ?? 0,
                id: parent.id
            }
        },
        profile: async (parent, _, context) => {
            const profile = await context.oracle.query.profile.findFirst({
                where: (fields, { eq }) => eq(fields.creator, parent.id)
            })

            return profile ? {
                ...profile,
                address: parent.address
            } : null
        },
        username: async (parent, _, context) => {
            return await context.oracle.query.username.findFirst({
                where: (fields, { eq }) => eq(fields.owner_address, parent.address)
            })
        },
        viewer: async (parent, args, context) => {
            const { viewer, address } = args

            if (address) {
                const viewerFollow = await context.oracle.selectDistinct()
                    .from(account)
                    .innerJoin(follow, eq(account.id, follow.follower_id))
                    .where(
                        and(
                            eq(account.address, address),
                            eq(follow.following_id, parent.id)
                        )
                    )

                const follows = viewerFollow?.at(0)?.account ? true : false

                const viewerFollowed = await context.oracle.selectDistinct()
                    .from(account)
                    .innerJoin(follow, eq(account.id, follow.following_id))
                    .where(
                        and(
                            eq(account.address, address),
                            eq(follow.follower_id, parent.id)
                        )
                    )

                const followed = viewerFollowed?.at(0)?.account ? true : false

                return {
                    follows,
                    followed,
                    id: parent.id
                }

            }

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
    },
    Follow: {
        follower: async (parent, _, context) => {
            return await context.oracle.query.account.findFirst({
                where: (fields, { eq }) => eq(fields.id, parent.follower_id)
            })
        },
        following: async (parent, _, context) => {
            return await context.oracle.query.account.findFirst({
                where: (fields, { eq }) => eq(fields.id, parent.following_id)
            })
        }
    }
}
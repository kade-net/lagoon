import { COMMUNITY, account, and, asc, communities, community_posts, desc, eq, ilike, like, membership, notInArray, or, publication, username } from "@kade-net/oracle"
import { Context, PaginationArg, Resolver, SORT_ORDER } from "../../../types"



interface ResolverMap {
    Query: {
        communities?: Resolver<any, PaginationArg & { sort: SORT_ORDER, creator: string, search: string, memberAddress?: string, following?: boolean }, Context>,
        accountCommunities?: Resolver<any, PaginationArg & { sort: SORT_ORDER, accountAddress: string }, Context>,
        community?: Resolver<any, { id: number, name: string }, Context>
        communityPublications?: Resolver<any, PaginationArg & { communityId: number, communityName: string, sort: SORT_ORDER, hide?: string[], muted?: number[] }, Context>,
        membership?: Resolver<any, { userName: string, communityName: string, userAddress: string }, Context>,
        memberships?: Resolver<any, PaginationArg & { sort: SORT_ORDER, communityId: number, communityName: string, search: string }, Context>,
    },
    Community?: {
        creator?: Resolver<COMMUNITY, any, Context>
        hosts?: Resolver<COMMUNITY, any, Context>,
        stats?: Resolver<COMMUNITY, any, Context>,
    }
}


export const CommunityResolver: ResolverMap = {
    Query: {
        communities: async (_, args, context) => {
            const { creator, pagination, sort = "DESC", search, memberAddress, following } = args
            const { page = 0, size = 20 } = pagination ?? {}

            if (memberAddress && (following === true || following === false)) {
                // outer join communities and membership
                const c_and_m = await context.oracle.select().from(communities)
                    .leftJoin(membership, eq(communities.id, membership.community_id))
                    .innerJoin(account, eq(membership.user_kid, account.id))
                    .where(
                        and(
                            eq(account.address, memberAddress),
                            following ? eq(membership.is_active, true) : or(
                                eq(membership.is_active, false),
                                eq(membership, null),
                                ilike(communities.name, `%${search}%`)
                            )
                        )
                    )
                    .orderBy(sort === "ASC" ? asc(communities.timestamp) : desc(communities.timestamp))
                    .limit(size)
                    .offset(page * size)

                return c_and_m?.map(c => c.communities) ?? []
            }

            if (memberAddress) {
                const c_and_m = await context.oracle.select().from(communities)
                    .innerJoin(membership, eq(communities.id, membership.community_id))
                    .innerJoin(account, eq(membership.user_kid, account.id))
                    .where(
                        and(

                            eq(account.address, memberAddress),
                            ilike(communities.name, `%${search}%`)
                        )
                    )
                    .orderBy(sort === "ASC" ? asc(communities.timestamp) : desc(communities.timestamp))
                    .limit(size)
                    .offset(page * size)

                return c_and_m?.map(c => c.communities) ?? []
            }


            const data = await context.oracle.query.communities.findMany({
                where(fields, { eq, and, like, }) {
                    if (creator) {

                        return eq(fields.creator_address, creator)
                    }
                    if (search) {
                        return ilike(fields.name, `%${search}%`)
                    }
                },
                orderBy: sort === "ASC" ? asc(communities.timestamp) : desc(communities.timestamp),
                limit: size,
                offset: page * size
            })

            return data
        },
        accountCommunities: async (_, args, context) => {
            const { accountAddress, pagination, sort = "DESC" } = args
            const { page = 0, size = 20 } = pagination ?? {}
            const account = await context.oracle.query.account.findFirst({
                where(fields, { eq }) {
                    return eq(fields.address, accountAddress)
                }
            })

            if (!account) return null

            const memberships = await context.oracle.query.membership.findMany({
                where(fields, { eq }) {
                    return eq(fields.user_kid, account.id)
                }
            })

            const communityIds = memberships.map(m => m.community_id)

            const data = await context.oracle.query.communities.findMany({
                where: (fields, { inArray }) => {
                    return inArray(fields.id, communityIds)
                },
                orderBy: sort === "ASC" ? asc(communities.timestamp) : desc(communities.timestamp),
                limit: size,
                offset: page * size
            })

            return data

        },
        community: async (_, args, context) => {
            const { id, name } = args
            const data = await context.oracle.query.communities.findFirst({
                where(fields, { eq }) {
                    if (id) {
                        return eq(fields.id, id)
                    }
                    return eq(fields.name, name)
                }
            })

            return data
        },
        communityPublications: async (_, args, context) => {
            const { communityId, communityName, pagination, sort = "DESC", hide, muted } = args
            const { page = 0, size = 20 } = pagination ?? {}

            const community = await context.oracle.transaction(async (txn) => {
                if (communityId) {
                    return await txn.query.communities.findFirst({
                        where(fields, { eq }) {
                            return eq(fields.id, communityId)
                        }
                    })
                }

                return await txn.query.communities.findFirst({
                    where(fields, { eq }) {
                        return eq(fields.name, communityName)
                    }
                })
            })

            if (!community) return []

            try {

                const data = await context.oracle.select({
                    publication: publication
                }).from(community_posts)
                .innerJoin(publication, eq(publication.id, community_posts.post_id))
                .where(
                    and(
                        eq(community_posts.community_id, community.id),
                        hide ? notInArray(publication.publication_ref, hide) : undefined,
                        muted ? notInArray(publication.creator_id, muted) : undefined
                    )
                )
                    .orderBy(sort === "ASC" ? asc(community_posts.timestamp) : desc(community_posts.timestamp))
                    .limit(size)
                    .offset(page * size)


                const posts = data?.map(d => d.publication) ?? []

                return posts
            }
            catch (e) {
                console.log(`SOmething went wrong::`, e)
                return []
            }
        },
        membership: async (_, args, context) => {
            const { userName, communityName, userAddress } = args

            const __membership = await context.oracle.transaction(async (txn) => {
                const __account = await txn.selectDistinct()
                    .from(account)
                    .innerJoin(username, eq(account.address, username.owner_address))
                    .where(
                        userAddress ? eq(account.address, userAddress) : eq(username.username, userName)
                    )
                const userAccount = __account?.at(0)?.account

                if (!userAccount) return null

                const _membership = await txn.selectDistinct()
                    .from(membership)
                    .innerJoin(account, eq(membership.user_kid, account.id))
                    .innerJoin(communities, eq(membership.community_id, communities.id))
                    .where(and(
                        eq(communities.name, communityName),
                        eq(membership.is_active, true),
                        eq(account.id, userAccount?.id)
                    ))
                    .orderBy(desc(membership.timestamp))
                    .limit(1)

                return _membership?.at(0)?.membership

            })

            return __membership ?? null
        },
        memberships: async (_, args, context) => {
            const { pagination, communityId, communityName, search, sort } = args
            const { page = 0, size = 20 } = pagination ?? {}

            const community = await context.oracle.transaction(async (txn) => {
                if (communityId) {
                    return await txn.query.communities.findFirst({
                        where(fields, { eq }) {
                            return eq(fields.id, communityId)
                        }
                    })
                }

                return await txn.query.communities.findFirst({
                    where(fields, { eq }) {
                        return eq(fields.name, communityName)
                    }
                })
            })

            const results = await context.oracle.selectDistinct()
                .from(membership)
                .innerJoin(account, eq(membership.user_kid, account.id))
                .innerJoin(username, eq(account.address, username.owner_address))
                .innerJoin(communities, eq(membership.community_id, communities.id))
                .where(
                    and(
                        community ? and(
                            eq(communities.id, community.id),
                            ilike(username.username, `%${search}%`),
                        ) :
                            ilike(username.username, `%${search}%`)
                    )
                )
                .orderBy(sort === "ASC" ? asc(membership.timestamp) : desc(membership.timestamp))
                .limit(size)
                .offset(page * size)

            return results?.map(r => r.account) ?? []

        }
    },
    Community: {
        creator: async (parent, _, context) => {
            const data = await context.oracle.query.account.findFirst({
                where(fields, { eq }) {
                    return eq(fields.id, parent.user_kid)
                }
            })

            return data
        },
        hosts: async (parent, _, context) => {
            const data = await context.oracle.query.membership.findMany({
                where(fields, { eq, and }) {
                    return and(
                        eq(fields.community_id, parent.id),
                        eq(fields.type, 1)
                    )
                },
                with: {
                    user: true
                }
            })

            const hosts = data.map(d => d.user)

            return hosts
        },
        stats: async (parent, _, context) => {
            const members = await context.oracle.query.membership.findMany({
                where(fields, { eq }) {
                    return eq(fields.community_id, parent.id)
                },
                columns: {
                    id: true
                }
            })

            const posts = await context.oracle.query.community_posts.findMany({
                where(fields, { eq }) {
                    return eq(fields.community_id, parent.id)
                },
                columns: {
                    id: true
                }
            })

            return {
                members: members?.length ?? 0,
                publications: posts?.length ?? 0
            }
        }
    }
}
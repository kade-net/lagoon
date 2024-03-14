import { COMMUNITY, asc, communities, community_posts, desc } from "oracle"
import { Context, PaginationArg, Resolver, SORT_ORDER } from "../../../types"



interface ResolverMap {
    Query: {
        communities?: Resolver<any, PaginationArg & { sort: SORT_ORDER, creator: string, search: string }, Context>,
        accountCommunities?: Resolver<any, PaginationArg & { sort: SORT_ORDER, accountAddress: string }, Context>,
        community?: Resolver<any, { id: number, name: string }, Context>
        communityPublications?: Resolver<any, PaginationArg & { communityId: number, communityName: string, sort: SORT_ORDER }, Context>
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
            const { creator, pagination, sort = "DESC", search } = args
            const { page = 0, size = 20 } = pagination ?? {}


            const data = await context.oracle.query.communities.findMany({
                where(fields, { eq, and, like }) {
                    if (creator) {
                        return eq(fields.creator_address, creator)
                    }
                    if (search) {
                        return like(fields.name, `${search}`)
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
            const { communityId, communityName, pagination, sort = "DESC" } = args
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


            const data = await context.oracle.query.community_posts.findMany({
                with: {
                    post: true
                },
                where(fields, { eq }) {
                    if (community) {
                        return eq(fields.community_id, community.id)
                    }
                },
                orderBy: sort === "ASC" ? asc(community_posts.timestamp) : desc(community_posts.timestamp),
                limit: size,
                offset: page * size
            })

            const posts = data.map(d => d.post)

            return posts
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
                posts: posts?.length ?? 0
            }
        }
    }
}
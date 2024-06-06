import KadeOracle, { PUBLICATION, and, asc, count, desc, eq, inArray, publication, reaction, notInArray, not, REACTION, } from "@kade-net/oracle"
import { Context, Pagination, PaginationArg, Resolver, SORT_ORDER } from "../../../types"
import _ from "lodash"
const { isNumber, isNull } = _

async function threadPublication(oracle: typeof KadeOracle, current: PUBLICATION, parents: Array<PUBLICATION>) {
    // 1. get children of a publication
    // 2. from the publication's children get all that were made by the user / repeat downstreaam until a publication has no children
    // 3. 
    const children = await oracle.query.publication.findMany({
        where(fields, operators) {
            return operators.and(
                operators.eq(fields.parent_id, current.id),
                operators.eq(fields.creator_id, current.creator_id)
            )
        },
        orderBy(fields, operators) {
            return operators.desc(fields.timestamp)
        }
    })

    if ((children?.length ?? 0) == 0) {
        return parents
    }

    const first_child = children.at(0)

    if (!first_child) return parents


    const data = [
        ...parents,
        first_child
    ]

    return await threadPublication(oracle, first_child, data)


}


interface ResolverMap {
    Query : {
        publication: Resolver<any, { id: number, creator: number, ref: string, creator_address: string }, Context>,
        publications: Resolver<any, PaginationArg & { creator: number, sort: SORT_ORDER, type: number, creator_address: string, types?: Array<number>, reaction?: number, hide?: string[], muted?: number[] }, Context>,
        publicationStats: Resolver<any, { id: number, ref: string }, Context>,
        publicationInteractionsByViewer: Resolver<any, { id: number, ref: string, viewer: number, address: string }, Context>
        publicationComments: Resolver<any, PaginationArg & { id: number, ref: string, sort: SORT_ORDER, hide?: string[], muted?: number[] }, Context>
        publicationThreads: Resolver<any, PaginationArg & { id: number, ref: string, sort: SORT_ORDER, hide?: string[], muted?: number[] }, Context>
    },
    Publication: {
        reactions: Resolver<PUBLICATION, PaginationArg & { sort: SORT_ORDER }, Context>
        creator: Resolver<PUBLICATION, any, Context>
        stats: Resolver<PUBLICATION, any, Context>
        viewer: Resolver<PUBLICATION, { viewer: number }, Context>
        children: Resolver<PUBLICATION, PaginationArg & { sort: SORT_ORDER, type: number }, Context>,
        parent: Resolver<PUBLICATION, any, Context>
        community: Resolver<PUBLICATION, any, Context>
    },
    Reaction: {
        creator: Resolver<REACTION, any, Context>
        publication: Resolver<REACTION, any, Context>
    }
}

export const PublicationResolver: ResolverMap = {
    Query: {
        publication: async (_, args, context) => {
            const { id, creator, ref, creator_address } = args
            let creator_id = creator
            if (!creator_id && creator_address) {
                const account = await context.oracle.query.account.findFirst({
                    where: (fields, { eq }) => eq(fields.address, creator_address)
                })
                if (account)
                    creator_id = account?.id
            }
            return await context.oracle.query.publication.findFirst({
                where: (fields, {eq}) => {
                    if (id){
                        return eq(fields.id, id)
                    }
                    if (creator_id) {
                        return eq(fields.creator_id, creator_id)
                    }
                    if (ref) {
                        return eq(fields.publication_ref, ref)
                    }
                }
            })
        },
        publications: async (_, args, context) => {
            const { type, creator_address, creator, types, reaction: _reaction, hide, muted } = args

            const { size = 10, page = 0 } = args.pagination ?? {}

            let creator_id = creator
            if (!creator_id && creator_address) {
                const account = await context.oracle.query.account.findFirst({
                    where: (fields, { eq }) => eq(fields.address, creator_address)
                })
                if (account)
                    creator_id = account?.id
            }

            if (isNumber(_reaction) && _reaction > 0) {
                const reactions_and_publication = await context.oracle.select()
                    .from(publication)
                    .innerJoin(reaction, eq(reaction.publication_id, publication.id))
                    .where(
                        and(
                            eq(reaction.creator_id, creator_id),
                            eq(reaction.reaction, _reaction),
                            type ?
                                eq(publication.type, type) :
                                types ?
                                    inArray(publication.type, types) :
                                    undefined,
                            and(
                                hide ? notInArray(publication.publication_ref, hide) : undefined,
                                muted ? notInArray(publication.creator_id, muted) : undefined
                            )
                        )
                    ).
                    orderBy(args?.sort == "ASC" ? asc(publication.timestamp) : desc(publication.timestamp))
                    .limit(size)
                    .offset(page * size)


                return reactions_and_publication?.map((r_n_p) => r_n_p.publication)
            }

            return await context.oracle.query.publication.findMany({
                offset: page * size,
                limit: size,
                where: creator_id ?
                    (fields, { eq, and, inArray, notInArray }) => type ? and(
                        eq(fields.creator_id, creator_id),
                        eq(fields.type, type),
                        hide ? notInArray(fields.publication_ref, hide) : undefined,
                        muted ? notInArray(fields.creator_id, muted) : undefined
                    ) :
                        types ? and(
                            eq(fields.creator_id, creator_id),
                            inArray(fields.type, types),
                            hide ? notInArray(fields.publication_ref, hide) : undefined,
                            muted ? notInArray(fields.creator_id, muted) : undefined
                        ) :
                            and(
                                eq(fields.creator_id, creator_id),
                                hide ? notInArray(fields.publication_ref, hide) : undefined,
                                muted ? notInArray(fields.creator_id, muted) : undefined
                            ) :
                    (fields, { eq, inArray, and, notInArray }) => type ? and(
                        eq(fields.type, type),
                        hide ? notInArray(fields.publication_ref, hide) : undefined,
                        muted ? notInArray(fields.creator_id, muted) : undefined
                    ) :
                        types ? and(inArray(fields.type, types),
                            hide ? notInArray(fields.publication_ref, hide) : undefined,
                            muted ? notInArray(fields.creator_id, muted) : undefined

                        ) : undefined,

                orderBy: args?.sort == "ASC" ? asc(publication.timestamp) : desc(publication.timestamp)
            })
        },
        publicationStats: async (_, args, context) => {
            const { id, ref } = args
            const publication_id = id ?? (await context.oracle.query.publication.findFirst({
                where: (fields, { eq }) => eq(fields.publication_ref, ref)
            }))?.id

            if (!publication_id) {
                return null
            }

            const _publication = await context.oracle.query.publication.findFirst({
                where: (fields, { eq }) => eq(fields.id, publication_id)
            })

            const reactions_count = await context.oracle.select({
                value: count()
            }).from(reaction).where(eq(reaction.publication_id, publication_id))

            const comments_count = await context.oracle.select({
                value: count()
            }).from(publication).where(and(
                eq(publication.parent_id, publication_id),
                eq(publication.type, 3)
            ))

            const quotes_count = await context.oracle.select({
                value: count()
            }).from(publication).where(
                and(
                    eq(publication.parent_id, publication_id),
                    eq(publication.type, 2)
                )
            )

            const reposts_count = await context.oracle.select({
                value: count()
            }).from(publication).where(
                and(
                    eq(publication.parent_id, publication_id),
                    eq(publication.type, 4)
                )
            )

            return {
                reactions: reactions_count.at(0)?.value ?? 0,
                comments: comments_count.at(0)?.value ?? 0,
                quotes: quotes_count.at(0)?.value ?? 0,
                reposts: reposts_count.at(0)?.value ?? 0,
                ref: _publication?.publication_ref
            }
        },
        publicationInteractionsByViewer: async (_, args, context) => {
            const { id, ref, viewer, address } = args

            const publication_id = id ?? (await context.oracle.query.publication.findFirst({
                where: (fields, { eq }) => eq(fields.publication_ref, ref)
            }))?.id

            if (!publication_id) {
                return null
            }

            const _publication = await context.oracle.query.publication.findFirst({
                where: (fields, { eq }) => eq(fields.id, publication_id)
            })

            const viewer_id = viewer ?? (await context.oracle.query.account.findFirst({
                where: (fields, { eq }) => eq(fields.address, address)
            }))?.id


            const reactions = await context.oracle.select({
                value: count()
            }).from(reaction)
                .where(
                    and(
                        eq(reaction.publication_id, publication_id),
                        eq(reaction.creator_id, viewer_id)
                    )
                )

            const comments = await context.oracle.query.publication.findMany({
                where: (fields, { eq, and }) => and(
                    eq(fields.parent_id, publication_id),
                    eq(fields.type, 3),
                    eq(fields.creator_id, viewer_id)
                ),
                columns: {
                    publication_ref: true
                }
            })


            const quotes = await context.oracle.query.publication.findMany({
                where: (fields, { eq, and }) => and(
                    eq(fields.parent_id, publication_id),
                    eq(fields.type, 2),
                    eq(fields.creator_id, viewer_id)
                ),
                columns: {
                    publication_ref: true
                }
            })

            const reposts = await context.oracle.query.publication.findMany({
                where: (fields, { eq, and }) => and(
                    eq(fields.parent_id, publication_id),
                    eq(fields.type, 4),
                    eq(fields.creator_id, viewer_id)
                ),
                columns: {
                    publication_ref: true
                }
            })

            return {
                reacted: (reactions.at(0)?.value ?? 0) > 0,
                commented: comments.length > 0,
                comment_refs: comments.map(c => c.publication_ref),
                quoted: quotes.length > 0,
                quote_refs: quotes.map(q => q.publication_ref),
                reposted: reposts.length > 0,
                repost_refs: reposts.map(r => r.publication_ref),
                ref: _publication?.publication_ref
            }
        },
        publicationComments: async (_, args, context) => {
            const { id, ref, hide, muted } = args
            const publication_id = id ?? (await context.oracle.query.publication.findFirst({
                where: (fields, { eq }) => eq(fields.publication_ref, ref)
            }))?.id

            if (!publication_id) {
                return null
            }

            const { size = 10, page = 0 } = args.pagination ?? {}
            return await context.oracle.query.publication.findMany({
                offset: page * size,
                limit: size,
                where: (fields, { eq, and }) => and(
                    eq(fields.parent_id, publication_id),
                    eq(fields.type, 3), // COMMENET TYPE
                    hide ? notInArray(fields.publication_ref, hide) : undefined,
                    muted ? notInArray(fields.creator_id, muted) : undefined
                ),
                orderBy: args?.sort == "ASC" ? asc(publication.timestamp) : desc(publication.timestamp)
            })
        },
        publicationThreads: async (_, args, context) => {
            const { id, ref } = args

            const publication = await context.oracle.query.publication.findFirst({
                where(fields, operators) {
                    if (id) {
                        return operators.eq(fields.id, id)
                    }

                    if (ref) {
                        return operators.eq(fields.publication_ref, ref)
                    }

                },
            })

            console.log(publication)

            if (!publication) return []

            const thread = await threadPublication(context.oracle, publication, [publication])

            return thread
        }
    },
    Publication: {
        reactions: async (parent, args, context) => {
            const { size = 10, page = 0 } = args.pagination ?? {}
            return await context.oracle.query.reaction.findMany({
                where: (fields, {eq}) => eq(fields.publication_id, parent.id),
                offset: page * size,
                limit: size,
                orderBy: args?.sort == "ASC" ? asc(reaction.timestamp) : desc(reaction.timestamp)
            })
        },
        creator: async (parent, _, context) => {
            return await context.oracle.query.account.findFirst({
                where: (fields, {eq}) => eq(fields.id, parent.creator_id)
            })
        },
        stats: async (parent, _, context) => {
            const reactions_count = await context.oracle.select({
                value: count()
            }).from(reaction).where(eq(reaction.publication_id, parent.id))

            const comments_count = await context.oracle.select({
                value: count()
            }).from(publication).where(and(
                eq(publication.parent_id, parent.id),
                eq(publication.type, 3)
            ))

            const quotes_count = await context.oracle.select({
                value: count()
            }).from(publication).where(
                and(
                    eq(publication.parent_id, parent.id),
                    eq(publication.type, 2)
                )
            )

            const reposts_count = await context.oracle.select({
                value: count()
            }).from(publication).where(
                and(
                    eq(publication.parent_id, parent.id),
                    eq(publication.type, 4)
                )
            )

            return {
                reactions: reactions_count.at(0)?.value ?? 0,
                comments: comments_count.at(0)?.value ?? 0,
                quotes: quotes_count.at(0)?.value ?? 0,
                reposts: reposts_count.at(0)?.value ?? 0
            }
        },
        viewer: async (parent, args, context) => {
            const { viewer } = args

            if (!viewer) {
                return null
            }

            const reactions = await context.oracle.select({
                value: count()
            }).from(reaction)
                .where(
                    and(
                        eq(reaction.publication_id, parent.id),
                        eq(reaction.creator_id, viewer)
                    )
                )


            const comments = await context.oracle.query.publication.findMany({
                where: (fields, { eq, and }) => and(
                    eq(fields.parent_id, parent.id),
                    eq(fields.type, 3),
                    eq(fields.creator_id, viewer)
                ),
                columns: {
                    publication_ref: true
                }
            })



            const quotes = await context.oracle.query.publication.findMany({
                where: (fields, { eq, and }) => and(
                    eq(fields.parent_id, parent.id),
                    eq(fields.type, 2),
                    eq(fields.creator_id, viewer)
                ),
                columns: {
                    publication_ref: true
                }
            })

            const reposts = await context.oracle.query.publication.findMany({
                where: (fields, { eq, and }) => and(
                    eq(fields.parent_id, parent.id),
                    eq(fields.type, 4),
                    eq(fields.creator_id, viewer)
                ),
                columns: {
                    publication_ref: true
                }
            })

            return {
                reacted: (reactions.at(0)?.value ?? 0) > 0,
                commented: comments.length > 0,
                comment_refs: comments.map(c => c.publication_ref),
                quoted: quotes.length > 0,
                quote_refs: quotes.map(q => q.publication_ref),
                reposted: reposts.length > 0,
                repost_refs: reposts.map(r => r.publication_ref),
                ref: parent.publication_ref
            }
        },
        children: async (parent, args, context) => {
            const { type } = args
            const { size = 10, page = 0 } = args.pagination ?? {}
            return await context.oracle.query.publication.findMany({
                offset: page * size,
                limit: size,
                where: (fields, { eq }) => type ? and(
                    eq(fields.parent_id, parent.id),
                    eq(fields.type, type)
                ) : eq(fields.parent_id, parent.id),
                orderBy: args?.sort == "ASC" ? asc(publication.timestamp) : desc(publication.timestamp)
            })
        },
        parent: async (parent, _, context) => {
            if (parent.type == 1) return null
            const parent_id = parent.parent_id
            if (!parent_id) {
                return null
            }
            return await context.oracle.query.publication.findFirst({
                where: (fields, { eq }) => eq(fields.id, parent_id)
            })
        },
        community: async (parent, _, context) => {
            const community_post = await context.oracle.query.community_posts.findFirst({
                where: (fields, { eq }) => eq(fields.post_id, parent.id)
            })

            if (!community_post) {
                return null
            }

            const community = await context.oracle.query.communities.findFirst({
                where: (fields, { eq }) => eq(fields.id, community_post.community_id)
            })

            return community
        }
    },
    Reaction: {
        creator: async (parent, _, context) => {
            return await context.oracle.query.account.findFirst({
                where: (fields, { eq }) => eq(fields.id, parent.creator_id)
            })
        },
        publication: async (parent, _, context) => {
            const { publication_id } = parent
            if (isNull(publication_id)) return null
            return await context.oracle.query.publication.findFirst({
                where: (fields, { eq }) => eq(fields.id, publication_id)
            })
        }
    }
}
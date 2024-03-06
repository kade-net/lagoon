import { PUBLICATION, and, asc, count, desc, eq, publication, reaction } from "oracle"
import { Context, Pagination, PaginationArg, Resolver, SORT_ORDER } from "../../../types"


interface ResolverMap {
    Query : {
        publication: Resolver<any, { id: number, creator: number, ref: string }, Context>,
        publications: Resolver<any, PaginationArg & { creator: number, sort: SORT_ORDER, type: number }, Context>
    },
    Publication: {
        reactions: Resolver<PUBLICATION, PaginationArg & { sort: SORT_ORDER }, Context>
        creator: Resolver<PUBLICATION, any, Context>
        stats: Resolver<PUBLICATION, any, Context>
        viewer: Resolver<PUBLICATION, { viewer: number }, Context>
        children: Resolver<PUBLICATION, PaginationArg & { sort: SORT_ORDER, type: number }, Context>,
        parent: Resolver<PUBLICATION, any, Context>
    }
}

export const PublicationResolver: ResolverMap = {
    Query: {
        publication: async (_, args, context) => {
            const { id, creator, ref } = args
            return await context.oracle.query.publication.findFirst({
                where: (fields, {eq}) => {
                    if (id){
                        return eq(fields.id, id)
                    }
                    if (creator){
                        return eq(fields.creator_id, creator)
                    }
                    if (ref) {
                        return eq(fields.publication_ref, ref)
                    }
                }
            })
        },
        publications: async (_, args, context) => {
            const { type } = args
            const { size = 10, page = 0 } = args.pagination ?? {}
            return await context.oracle.query.publication.findMany({
                offset: page * size,
                limit: size,
                where: args.creator ?
                    (fields, { eq, and }) => type ? and(
                        eq(fields.creator_id, args.creator),
                        eq(fields.type, type)
                    ) : eq(fields.creator_id, args.creator) :
                    (fields, { eq }) => type ? eq(fields.type, type) : undefined,
                orderBy: args?.sort == "ASC" ? asc(publication.timestamp) : desc(publication.timestamp)
            })
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


            const comments = await context.oracle.select({
                value: count()
            }).from(publication)
                .where(
                    and(
                        eq(publication.parent_id, parent.id),
                        eq(publication.type, 3),
                        eq(publication.creator_id, viewer)
                    )
                )

            const quotes = await context.oracle.select({
                value: count()
            }).from(publication)
                .where(
                    and(
                        eq(publication.parent_id, parent.id),
                        eq(publication.type, 2),
                        eq(publication.creator_id, viewer)
                    )
                )

            const reposts = await context.oracle.select({
                value: count()
            }).from(publication)
                .where(
                    and(
                        eq(publication.parent_id, parent.id),
                        eq(publication.type, 4),
                        eq(publication.creator_id, viewer)
                    )
                )

            return {
                reactions: reactions.at(0)?.value ?? 0,
                comments: comments.at(0)?.value ?? 0,
                quotes: quotes.at(0)?.value ?? 0,
                reposts: reposts.at(0)?.value ?? 0
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
            const parent_id = parent.parent_id
            if (!parent_id) {
                return null
            }
            return await context.oracle.query.publication.findFirst({
                where: (fields, { eq }) => eq(fields.id, parent_id)
            })
        }
    }
}
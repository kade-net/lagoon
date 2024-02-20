import { PUBLICATION, asc, comment, count, desc, eq, publication, quote, reaction, repost } from "oracle"
import { Context, Pagination, PaginationArg, Resolver, SORT_ORDER } from "../../../types"


interface ResolverMap {
    Query : {
        publication: Resolver<any, {id: number, creator: number}, Context>,
        publications: Resolver<any, PaginationArg & {creator: number, sort: SORT_ORDER} , Context>
    },
    Publication: {
        reactions: Resolver<PUBLICATION, PaginationArg & {sort: SORT_ORDER}, Context>
        comments: Resolver<PUBLICATION, PaginationArg & {sort: SORT_ORDER} , Context>
        quotes: Resolver<PUBLICATION, PaginationArg & {sort: SORT_ORDER}, Context>
        reposts: Resolver<PUBLICATION, PaginationArg & {sort: SORT_ORDER} , Context>
        creator: Resolver<PUBLICATION, any, Context>
        stats: Resolver<PUBLICATION, any, Context>
    }
}

export const PublicationResolver: ResolverMap = {
    Query: {
        publication: async (_, args, context) => {
            const { id, creator } = args
            return await context.oracle.query.publication.findFirst({
                where: (fields, {eq}) => {
                    if (id){
                        return eq(fields.id, id)
                    }
                    if (creator){
                        return eq(fields.creator_id, creator)
                    }
                }
            })
        },
        publications: async (_, args, context) => {
            const { size = 10, page = 0 } = args.pagination ?? {}
            return await context.oracle.query.publication.findMany({
                offset: page * size,
                limit: size,
                where: args.creator ? (fields, {eq}) => eq(fields.creator_id, args.creator) : undefined,
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
        comments: async (parent, args, context) => {
            const { size = 10, page = 0 } = args.pagination ?? {}
            return await context.oracle.query.comment.findMany({
                where: (fields, {eq}) => eq(fields.publication_id, parent.id),
                offset: page * size,
                limit: size,
                orderBy: args?.sort == "ASC" ? asc(comment.timestamp) : desc(comment.timestamp)
            })
        },
        quotes: async (parent, args, context) => {
            const { size = 10, page = 0 } = args.pagination ?? {}
            return await context.oracle.query.quote.findMany({
                where: (fields, {eq}) => eq(fields.publication_id, parent.id),
                offset: page * size,
                limit: size,
                orderBy: args?.sort == "ASC" ? asc(quote.timestamp) : desc(quote.timestamp)
            })
        },
        reposts: async (parent, args, context) => {
            const { size = 10, page = 0 } = args.pagination ?? {}
            return await context.oracle.query.repost.findMany({
                where: (fields, {eq}) => eq(fields.publication_id, parent.id),
                offset: page * size,
                limit: size,
                orderBy: args?.sort == "ASC" ? asc(repost.timestamp) : desc(repost.timestamp)
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
            }).from(comment).where(eq(comment.publication_id, parent.id))

            const quotes_count = await context.oracle.select({
                value: count()
            }).from(quote).where(eq(quote.publication_id, parent.id))

            const reposts_count = await context.oracle.select({
                value: count()
            }).from(repost).where(eq(repost.publication_id, parent.id))

            return {
                reactions: reactions_count.at(0)?.value ?? 0,
                comments: comments_count.at(0)?.value ?? 0,
                quotes: quotes_count.at(0)?.value ?? 0,
                reposts: reposts_count.at(0)?.value ?? 0
            }
        }
    }
}
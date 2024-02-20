import KadeOracle, { QUOTE, asc, comment, count, desc, eq, quote, reaction, sql } from "oracle"
import { Context, PaginationArg, Resolver, SORT_ORDER } from "../../../types"


interface ResolverMap {
    Query: {
        quote: Resolver<any, {id: number}, Context>,
        quotes: Resolver<any, PaginationArg & { creator: number, publication_id: number, sort: SORT_ORDER}, Context>
    },
    Quote: {
        creator: Resolver<QUOTE, any, Context>,
        publication: Resolver<QUOTE, any, Context>
        reactions: Resolver<QUOTE, PaginationArg & {sort: SORT_ORDER}, Context>
        comments: Resolver<QUOTE, PaginationArg & {sort: SORT_ORDER}, Context>
        stats: Resolver<QUOTE, any, Context>
    }
}

export const QuoteResolver: ResolverMap = {
    Query: {
        quote: async (_, args, context) => {
            const { id } = args
            return await context.oracle.query.quote.findFirst({
                where: (fields, {eq}) => eq(fields.id, id)
            })
        },
        quotes: async (_, args, context) => {
            const { size = 10, page = 0 } = args?.pagination ?? {}
            return await context.oracle.query.quote.findMany({
                offset: page * size,
                limit: size,
                where: (fields, {eq, and}) => {
                    if (args?.creator && args?.publication_id){
                        return and(
                            eq(fields.creator_id, args.creator),
                            eq(fields.publication_id, args.publication_id)
                        )
                    }
                    if (args?.creator){
                        return eq(fields.creator_id, args.creator)
                    }

                    if (args?.publication_id){
                        return eq(fields.publication_id, args.publication_id)
                    }
                },
                orderBy: args?.sort == "ASC" ? asc(quote.timestamp) : desc(quote.timestamp)
            })
        }
    },
    Quote: {
        creator: async (parent, _, context) => {
            return await context.oracle.query.account.findFirst({
                where: (fields, {eq}) => eq(fields.id, parent.creator_id),

            })
        },
        publication: async (parent, _, context) => {
            return await context.oracle.query.publication.findFirst({
                where: (fields, {eq}) => eq(fields.id, parent.publication_id)
            })
        },
        reactions: async (parent, args, context) => {
            const { size = 10, page = 0 } = args.pagination
            return await context.oracle.query.reaction.findMany({
                where: (fields, {eq}) => eq(fields.quote_id, parent.id),
                offset: page * size,
                limit: size,
                orderBy: args?.sort == "ASC" ? asc(reaction.timestamp) : desc(reaction.timestamp)
            })
        },
        stats: async (parent, _, context) => {
            const reactions_count = await KadeOracle.select({
                value: count()
            }).from(reaction).where(eq(reaction.quote_id, parent.id))

            const comments_count = await KadeOracle.select({
                value: count()
            }).from(comment).where(eq(comment.quote_id, parent.id))
            

            return {
                reactions: reactions_count.at(0)?.value ?? 0,
                comments: comments_count.at(0)?.value ?? 0,
            }

        },
        comments: async (parent, args, context) => {
            const { size = 10, page = 0 } = args.pagination ?? {}
            return await context.oracle.query.comment.findMany({
                where: (fields, {eq}) => eq(fields.quote_id, parent.id),
                offset: page * size,
                limit: size,
                orderBy: args?.sort == "ASC" ? asc(comment.timestamp) : desc(comment.timestamp)
            })
        }
    }
}
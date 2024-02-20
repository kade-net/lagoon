import { COMMENT, asc, comment, count, desc, eq, reaction } from "oracle"
import { Context, PaginationArg, Resolver, SORT_ORDER } from "../../../types"


interface ResolverMap {
    Query: {
        comment: Resolver<any, {id: number}, Context>
        comments: Resolver<any, PaginationArg & {creator: number, refference_id: number, comment_type: number, sort: SORT_ORDER}, Context>
    },
    Comment: {
        creator: Resolver<COMMENT, any, Context>
        refference: Resolver<COMMENT, any, Context>
        reactions: Resolver<COMMENT, PaginationArg & {sort: SORT_ORDER}, Context>
        comments: Resolver<COMMENT, PaginationArg & {sort: SORT_ORDER}, Context>
        stats: Resolver<COMMENT, any, Context>
    }
}

export const CommentResolver: ResolverMap = {
    Query: {
        comment: async (_, args, context) => {
            const { id } = args
            return await context.oracle.query.comment.findFirst({
                where: (fields, {eq}) => eq(fields.id, id)
            })
        },
        comments: async (_, args, context) => {
            const { size = 10, page = 0 } = args.pagination ?? {}
            return await context.oracle.query.comment.findMany({
                offset: page * size,
                limit: size,
                where: (fields, {eq, and}) => {
                    if(args?.creator && args?.refference_id && args?.comment_type){
                        const ctype = args.comment_type
                        return and(
                            eq(fields.creator_id, args.creator),
                            eq( ctype == 1 ? fields.publication_id : ctype == 2 ? fields.quote_id : fields.comment_id, args.refference_id),
                        )
                    }
                    if (args?.creator){
                        return eq(fields.creator_id, args.creator)
                    }
                },
                orderBy: args?.sort == "ASC" ? asc(comment.timestamp) : desc(comment.timestamp)
            })
        }
    },
    Comment: {
        creator: async (parent, _, context) => {
            return await context.oracle.query.account.findFirst({
                where: (fields, {eq}) => eq(fields.id, parent.creator_id)
            })
        },
        refference: async (parent, _, context) => {
            if(parent.comment_id){
                return await context.oracle.query.comment.findFirst({
                    where: (fields, {eq}) => eq(fields.id, parent.comment_id as unknown as number)
                })
            }
            if(parent.publication_id){
                return await context.oracle.query.publication.findFirst({
                    where: (fields, {eq}) => eq(fields.id, parent.publication_id as unknown as number)
                })
            }
            if(parent.quote_id){
                return await context.oracle.query.quote.findFirst({
                    where: (fields, {eq}) => eq(fields.id, parent.quote_id as unknown as number)
                })
            }
        },
        reactions: async (parent, args, context) => {
            const { size = 10, page = 0 } = args.pagination ?? {}
            return await context.oracle.query.reaction.findMany({
                where: (fields, {eq}) => eq(fields.comment_id, parent.id),
                offset: page * size,
                limit: size,
                orderBy: args?.sort == "ASC" ? asc(reaction.timestamp) : desc(reaction.timestamp)
            })
        },
        comments: async (parent, args, context) => {
            const { size = 10, page = 0 } = args.pagination ?? {}
            return await context.oracle.query.comment.findMany({
                where: (fields, {eq}) => eq(fields.comment_id, parent.id),
                offset: page * size,
                limit: size,
                orderBy: args?.sort == "ASC" ? asc(comment.timestamp) : desc(comment.timestamp)
            })
        },
        stats: async (parent, _, context) => {
            const reactions_count = await context.oracle.select({
                value: count()
            }).from(reaction).where(eq(reaction.comment_id, parent.id))

            const comments_count = await context.oracle.select({
                value: count()
            }).from(comment).where(eq(comment.comment_id, parent.id))

            return {
                reactions: reactions_count.at(0)?.value ?? 0,
                comments: comments_count.at(0)?.value ?? 0
            }
        }
    }
}
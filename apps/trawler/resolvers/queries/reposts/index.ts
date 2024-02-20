import { REPOST, asc, desc, repost } from "oracle"
import { Context, Pagination, PaginationArg, Resolver, SORT_ORDER } from "../../../types"



interface ResolverMap {
    Query: {
        repost: Resolver<any, {id: number}, Context>,
        reposts: Resolver<any, PaginationArg & {creator: number, publication_id: number, sort: SORT_ORDER} | null, Context>
    },
    RePost: {
        creator: Resolver<REPOST, any, Context>,
        publication: Resolver<REPOST, any, Context>
    }
}


export const RepostsResolver: ResolverMap = {
    Query: {
        repost: async (_, args, context) => {
            const { id } = args
            return await context.oracle.query.repost.findFirst({
                where: (fields, {eq}) => eq(fields.id, id)
            })
        },
        reposts: async (_, args, context) => {
            const { size = 10, page = 0 } = args?.pagination ?? {}
            return await context.oracle.query.repost.findMany({
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
                orderBy: args?.sort == "ASC" ? asc(repost.timestamp) : desc(repost.timestamp)
            })
        }
    },
    RePost: {
        creator: async (parent, _, context) => {
            return await context.oracle.query.account.findFirst({
                where: (fields, {eq}) => eq(fields.id, parent.creator_id)
            })
        },
        publication: async (parent, _, context) => {
            return await context.oracle.query.publication.findFirst({
                where: (fields, {eq}) => eq(fields.id, parent.publication_id)
            })
        }
    }
}
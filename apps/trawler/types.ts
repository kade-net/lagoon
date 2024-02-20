import KadeOracle from "oracle"


export type Context = {
    oracle: typeof KadeOracle
}


export type Resolver<P = any, A = any, C = any, R =any> = (parent: P, args: A, context: C) => any | Promise<R>

export type Pagination = {
    size: number
    page: number
}

export type PaginationArg = {
    pagination: Pagination
}

export type SORT_ORDER = "ASC" | "DESC"
import { z } from "zod";

const account_create_event_schema = z.object({
    username: z.string(),
    creator_address: z.string(),
    account_object_address: z.string(),
    kid: z.string().transform((p)=> parseInt(p)),
    timestamp: z.string().transform(p => `${p}000`).transform((p)=> {
        return parseInt(p)
    }).transform((p)=> new Date(p))
})

const delegate_create_event_schema = z.object({
    owner_address: z.string(),
    object_address: z.string(),
    delegate_address: z.string(),
    kid: z.string().transform((p)=> parseInt(p)),
    timestamp: z.string().transform(p => `${p}000`).transform((p)=> parseInt(p)).transform((p)=> new Date(p))
})

const delegate_remove_event_schema = z.object({
    owner_address: z.string(),
    object_address: z.string(),
    delegate_address: z.string(),
    kid: z.string().transform((p)=> parseInt(p)),
    timestamp: z.string().transform(p => `${p}000`).transform((p)=> parseInt(p)).transform((p)=> new Date(p))
})

const reaction_create_event_schema = z.object({
    kid: z.string().transform((p)=> parseInt(p)),
    user_kid: z.string().transform((p)=> parseInt(p)),
    delegate: z.string(),
    reaction: z.string().transform((p)=> parseInt(p)),
    reference_kid: z.string().transform((p)=> parseInt(p)),
    timestamp: z.string().transform(p => `${p}000`).transform((p)=> parseInt(p)).transform((p)=> new Date(p)),
    type: z.string().transform((p)=> parseInt(p)),
})

const reaction_remove_event_schema = z.object({
    kid: z.string().transform((p)=> parseInt(p)),
    user_kid: z.string().transform((p)=> parseInt(p)),
    delegate: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p)=> parseInt(p)).transform((p)=> new Date(p)),
})

const quote_create_event_schema = z.object({
    kid: z.string().transform((p)=> parseInt(p)),
    user_kid: z.string().transform((p)=> parseInt(p)),
    reference_kid: z.string().transform((p)=> parseInt(p)),
    delegate: z.string(),
    payload: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p)=> parseInt(p)).transform((p)=> new Date(p)),
})

const quote_remove_event_schema = z.object({
    kid: z.string().transform((p)=> parseInt(p)),
    user_kid: z.string().transform((p)=> parseInt(p)),
    delegate: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p)=> parseInt(p)).transform((p)=> new Date(p)),
})

const repost_create_event_schema = z.object({
    kid: z.string().transform((p)=> parseInt(p)),
    reference_kid: z.string().transform((p)=> parseInt(p)),
    user_kid: z.string().transform((p)=> parseInt(p)),
    delegate: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p)=> parseInt(p)).transform((p)=> new Date(p)),
    type: z.string().transform((p)=> parseInt(p)),
})

const repost_remove_event_schema = z.object({
    kid: z.string().transform((p)=> parseInt(p)),
    user_kid: z.string().transform((p)=> parseInt(p)),
    delegate: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p)=> parseInt(p)).transform((p)=> new Date(p)),
})

const comment_create_event_schema = z.object({
    kid: z.string().transform((p)=> parseInt(p)),
    reference_kid: z.string().transform((p)=> parseInt(p)),
    user_kid: z.string().transform((p)=> parseInt(p)),
    delegate: z.string(),
    type: z.string().transform((p)=> parseInt(p)),
    timestamp: z.string().transform(p => `${p}000`).transform((p)=> parseInt(p)).transform((p)=> new Date(p)),
    content: z.string(),
})

const comment_remove_event_schema = z.object({
    kid: z.string().transform((p)=> parseInt(p)),
    user_kid: z.string().transform((p)=> parseInt(p)),
    delegate: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p)=> parseInt(p)).transform((p)=> new Date(p)),
})

const publication_create_event_schema = z.object({
    kid: z.string().transform((p)=> parseInt(p)),
    payload: z.string(),
    user_kid: z.string().transform((p)=> parseInt(p)),
    delegate: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p)=> parseInt(p)).transform((p)=> new Date(p)),
})

const publication_remove_event_schema = z.object({
    kid: z.string().transform((p)=> parseInt(p)),
    user_kid: z.string().transform((p)=> parseInt(p)),
    delegate: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p)=> parseInt(p)).transform((p)=> new Date(p)),
})

const account_follow_event_schema = z.object({
    follower_kid: z.string().transform((p)=> parseInt(p)),
    following_kid: z.string().transform((p)=> parseInt(p)),
    follower: z.string(),
    following: z.string(),
    kid: z.string().transform((p)=> parseInt(p)),
    delegate: z.string(),
    user_kid: z.string().transform((p)=> parseInt(p)),
    timestamp: z.string().transform(p => `${p}000`).transform((p)=> parseInt(p)).transform((p)=> new Date(p)),
})

const account_unfollow_event_schema = z.object({
    kid: z.string().transform((p)=> parseInt(p)),
    user_kid: z.string().transform((p)=> parseInt(p)),
    delegate: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p)=> parseInt(p)).transform((p)=> new Date(p)),
})


const schema = {
    account_create_event_schema,
    delegate_create_event_schema,
    delegate_remove_event_schema, 
    account_follow_event_schema,
    account_unfollow_event_schema,
    reaction_create_event_schema,
    reaction_remove_event_schema,
    quote_create_event_schema,
    quote_remove_event_schema,
    repost_create_event_schema,
    repost_remove_event_schema,
    comment_create_event_schema,
    comment_remove_event_schema,
    publication_create_event_schema,
    publication_remove_event_schema,
}


export default schema
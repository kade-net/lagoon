import { KADE_EVENTS } from "../actions";
import db from "./client";
export const account_events = db.collection<KADE_EVENTS.EVENT<KADE_EVENTS.ACCOUNT_CREATE_EVENT>>("account_events")
export const delegate_create_events = db.collection<KADE_EVENTS.EVENT<KADE_EVENTS.DELEGATE_CREATE_EVENT>>("delegate_create_events")
export const delegate_remove_events = db.collection<KADE_EVENTS.EVENT<KADE_EVENTS.DELEGATE_REMOVE_EVENT>>("delegate_remove_events")
export const account_follow_events = db.collection<KADE_EVENTS.EVENT<KADE_EVENTS.ACCOUNT_FOLLOW_EVENT>>("account_follow_events")
export const account_unfollow_events = db.collection<KADE_EVENTS.EVENT<KADE_EVENTS.ACCOUNT_UNFOLLOW_EVENT>>("account_unfollow_events")

export const publication_create_events = db.collection<KADE_EVENTS.EVENT<KADE_EVENTS.PUBLICATION_CREATE_EVENT>>("publication_create_events")
export const publication_remove_events = db.collection<KADE_EVENTS.EVENT<KADE_EVENTS.PUBLICATION_REMOVE_EVENT>>("publication_remove_events")
export const comment_create_events = db.collection<KADE_EVENTS.EVENT<KADE_EVENTS.COMMENT_CREATE_EVENT>>("comment_create_events")
export const comment_remove_events = db.collection<KADE_EVENTS.EVENT<KADE_EVENTS.COMMENT_REMOVE_EVENT>>("comment_remove_events")
export const quote_create_events = db.collection<KADE_EVENTS.EVENT<KADE_EVENTS.QUOTE_CREATE_EVENT>>("quote_create_events")
export const quote_remove_events = db.collection<KADE_EVENTS.EVENT<KADE_EVENTS.QUOTE_REMOVE_EVENT>>("quote_remove_events")
export const reaction_create_events = db.collection<KADE_EVENTS.EVENT<KADE_EVENTS.REACTION_CREATE_EVENT>>("reaction_create_events")
export const reaction_remove_events = db.collection<KADE_EVENTS.EVENT<KADE_EVENTS.REACTION_REMOVE_EVENT>>("reaction_remove_events")
export const repost_create_events = db.collection<KADE_EVENTS.EVENT<KADE_EVENTS.REPOST_CREATE_EVENT>>("repost_create_events")
export const repost_remove_events = db.collection<KADE_EVENTS.EVENT<KADE_EVENTS.REPOST_REMOVE_EVENT>>("repost_remove_events")

export const username_registration_events = db.collection<KADE_EVENTS.EVENT<KADE_EVENTS.USERNAME_REGISTRATION_EVENT>>("username_registration_events")
export const profile_update_events = db.collection<KADE_EVENTS.EVENT<KADE_EVENTS.PROFILE_UPDATE_EVENT>>("profile_update_events")


export const parserConfig = db.collection<KADE_EVENTS.EVENT_PARSER_CONFIG>("parser_config")

// https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/ae8b32d4-247f-4fb5-7700-9f3c26cbca00/rectcontain3

// https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_png/https%3A%2F%2Fproxy.wrpcd.net%2F%3Furl%3Dhttps%253A%252F%252Fzora.co%252Fapi%252Fthumbnail%252F7777777%252F0xb42f7bf4cf5886f474df1ec813184acdae9d754c%252F9%26s%3D683afa333eb035d7272614fa7ff52522dbb121419d7937853b186178f3e45838
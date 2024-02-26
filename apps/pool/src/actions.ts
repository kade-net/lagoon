import { z } from "zod"
import schema from "./schema"

export namespace KADE_EVENTS {

    export type EVENT_TYPE = 'ACCOUNT_CREATE' | 'DELEGATE_CREATE' | 'DELEGATE_REMOVE' | 'REACTION_CREATE' | 'REACTION_REMOVE' | 'QUOTE_CREATE' | 'QUOTE_REMOVE' | 'REPOST_CREATE' | 'REPOST_REMOVE' | 'COMMENT_CREATE' | 'COMMENT_REMOVE' | 'PUBLICATION_CREATE' | 'PUBLICATION_REMOVE' | 'ACCOUNT_FOLLOW' | 'ACCOUNT_UNFOLLOW' | 'USERNAME_REGISTREATION' | 'PROFILE_UPDATE'

    export interface EVENT_PARSER_CONFIG {
        account_create_last_sequence_number: number,
        delegate_create_last_sequence_number: number,   
        delegate_remove_last_sequence_number: number,
        account_follow_last_sequence_number: number,
        account_unfollow_last_sequence_number: number,
        reaction_create_last_sequence_number: number,
        reaction_remove_last_sequence_number: number,
        quote_create_last_sequence_number: number,
        quote_remove_last_sequence_number: number,
        repost_create_last_sequence_number: number,
        repost_remove_last_sequence_number: number,
        comment_create_last_sequence_number: number,
        comment_remove_last_sequence_number: number,
        publication_create_last_sequence_number: number,
        publication_remove_last_sequence_number: number,
        profile_update_last_sequence_number: number,
        username_registration_last_sequence_number: number,
    }

    export interface EVENT<T = any> {
        type: EVENT_TYPE ,
        payload: T,
        timestamp: Date,
        written: boolean
        is_valid: boolean,
        first_seen: Date
    }

    export type ACCOUNT_CREATE_EVENT = z.infer<typeof schema.account_create_event_schema>

    export type DELEGATE_CREATE_EVENT = z.infer<typeof schema.delegate_create_event_schema>

    export type DELEGATE_REMOVE_EVENT = z.infer<typeof schema.delegate_remove_event_schema>

    export type ACCOUNT_FOLLOW_EVENT = z.infer<typeof schema.account_follow_event_schema>

    export type ACCOUNT_UNFOLLOW_EVENT = z.infer<typeof schema.account_unfollow_event_schema>

    export type REACTION_CREATE_EVENT = z.infer<typeof schema.reaction_create_event_schema>

    export type REACTION_REMOVE_EVENT = z.infer<typeof schema.reaction_remove_event_schema>

    export type QUOTE_CREATE_EVENT = z.infer<typeof schema.quote_create_event_schema>

    export type QUOTE_REMOVE_EVENT = z.infer<typeof schema.quote_remove_event_schema>

    export type REPOST_CREATE_EVENT = z.infer<typeof schema.repost_create_event_schema>

    export type REPOST_REMOVE_EVENT = z.infer<typeof schema.repost_remove_event_schema>

    export type COMMENT_CREATE_EVENT = z.infer<typeof schema.comment_create_event_schema>

    export type COMMENT_REMOVE_EVENT = z.infer<typeof schema.comment_remove_event_schema>

    export type PUBLICATION_CREATE_EVENT = z.infer<typeof schema.publication_create_event_schema>

    export type PUBLICATION_REMOVE_EVENT = z.infer<typeof schema.publication_remove_event_schema>

    export type USERNAME_REGISTRATION_EVENT = z.infer<typeof schema.username_registration_event_schema>

    export type PROFILE_UPDATE_EVENT = z.infer<typeof schema.profile_update_event_schema>

}
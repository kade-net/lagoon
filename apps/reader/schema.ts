import { z } from "zod";

const account_create_event_schema = z.object({
    username: z.string(),
    creator_address: z.string(),
    account_object_address: z.string(),
    kid: z.string().transform((p) => parseInt(p)),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => {
        return parseInt(p)
    }).transform((p) => new Date(p))
})

const delegate_create_event_schema = z.object({
    owner_address: z.string(),
    object_address: z.string(),
    delegate_address: z.string(),
    kid: z.string().transform((p) => parseInt(p)),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p))
})

const delegate_remove_event_schema = z.object({
    owner_address: z.string(),
    object_address: z.string(),
    delegate_address: z.string(),
    kid: z.string().transform((p) => parseInt(p)),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p))
})

const reaction_create_event_schema = z.object({
    kid: z.string().transform((p) => parseInt(p)),
    user_kid: z.string().transform((p) => parseInt(p)),
    delegate: z.string(),
    reaction: z.string().transform((p) => parseInt(p)),
    reference_kid: z.string().transform((p) => parseInt(p)),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p)),
})

const reaction_remove_event_schema = z.object({
    kid: z.string().transform((p) => parseInt(p)),
    user_kid: z.string().transform((p) => parseInt(p)),
    delegate: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p)),
})

const reaction_create_event_with_ref = z.object({
    kid: z.string().transform((p) => parseInt(p)),
    user_kid: z.string().transform((p) => parseInt(p)),
    delegate: z.string(),
    reaction: z.string().transform((p) => parseInt(p)),
    publication_ref: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p)),
})

const reaction_remove_event_with_ref = z.object({
    user_kid: z.string().transform((p) => parseInt(p)),
    delegate: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p)),
    ref: z.string(),
})

const publication_create_event_schema = z.object({
    kid: z.string().transform((p) => parseInt(p)),
    payload: z.string(),
    user_kid: z.string().transform((p) => parseInt(p)),
    delegate: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p)),
    type: z.string().transform((p) => parseInt(p)),
    reference_kid: z.string().transform((p) => parseInt(p)),
    publication_ref: z.string(),
})

const publication_remove_event_schema = z.object({
    kid: z.string().transform((p) => parseInt(p)),
    user_kid: z.string().transform((p) => parseInt(p)),
    delegate: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p)),
})

const publication_create_with_ref_event_schema = z.object({
    kid: z.string().transform((p) => parseInt(p)),
    payload: z.string(),
    user_kid: z.string().transform((p) => parseInt(p)),
    delegate: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p)),
    type: z.string().transform((p) => parseInt(p)),
    publication_ref: z.string(),
    parent_ref: z.string(),
})

const publication_remove_with_ref_event_schema = z.object({
    user_kid: z.string().transform((p) => parseInt(p)),
    delegate: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p)),
    ref: z.string(),
})

const account_follow_event_schema = z.object({
    follower_kid: z.string().transform((p) => parseInt(p)),
    following_kid: z.string().transform((p) => parseInt(p)),
    follower: z.string(),
    following: z.string(),
    kid: z.string().transform((p) => parseInt(p)),
    delegate: z.string(),
    user_kid: z.string().transform((p) => parseInt(p)),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p)),
})

const account_unfollow_event_schema = z.object({
    user_kid: z.string().transform((p) => parseInt(p)),
    unfollowing_kid: z.string().transform((p) => parseInt(p)),
    delegate: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p)),
})

const username_registration_event_schema = z.object({
    username: z.string(),
    owner_address: z.string(),
    token_address: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p))
})


const profile_update_event_schema = z.object({
    user_kid: z.string().transform((p) => parseInt(p)),
    delegate: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p)),
    pfp: z.string(),
    bio: z.string(),
    display_name: z.string(),
})

// COMMUNITIES
/**
 * struct  CommunityRegisteredEvent has store, drop {
        name: string::String,
        description: string::String,
        image: string::String,
        creator: address,
        bid: u64,
        user_kid: u64,
        timestamp: u64,
    }
 */
const community_registered_event_schema = z.object({
    name: z.string(),
    description: z.string(),
    image: z.string(),
    creator: z.string(),
    bid: z.string().transform((p) => parseInt(p)),
    user_kid: z.string().transform((p) => parseInt(p)),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p))
})


const member_join_event_schema = z.object({
    owner: z.string(),
    community_name: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p)),
    bid: z.string().transform((p) => parseInt(p)),
    type: z.string().transform((p) => parseInt(p)),
    user_kid: z.string().transform((p) => parseInt(p)),
})

/**
 * struct MembershipChangeEvent has store, drop {
        type: u64,
        made_by: address,
        membership_owner: address,
        community_name: string::String,
        community_id: u64,
        membership_id: u64,
        timestamp: u64,
        user_kid: u64,
    }
 */
const membership_change_event_schema = z.object({
    type: z.string().transform((p) => parseInt(p)),
    made_by: z.string(),
    membership_owner: z.string(),
    community_name: z.string(),
    community_id: z.string().transform((p) => parseInt(p)),
    membership_id: z.string().transform((p) => parseInt(p)),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p)),
    user_kid: z.string().transform((p) => parseInt(p)),
})

/**
 * struct MembershipDeleteEvent has store, drop {
        community_name: string::String,
        community_id: u64,
        membership_id: u64,
        user_kid: u64,
        timestamp: u64,
    }
 */
const membership_delete_event_schema = z.object({
    community_name: z.string(),
    community_id: z.string().transform((p) => parseInt(p)),
    membership_id: z.string().transform((p) => parseInt(p)),
    user_kid: z.string().transform((p) => parseInt(p)),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p)),
})

/**
 * struct MembershipReclaimEvent has store, drop {
        community_id: u64,
        membership_id: u64,
        user_kid: u64,
        timestamp: u64,
    }
 */
const membership_reclaim_event_schema = z.object({
    community_id: z.string().transform((p) => parseInt(p)),
    membership_id: z.string().transform((p) => parseInt(p)),
    user_kid: z.string().transform((p) => parseInt(p)),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p)),
})

/**
 * 
    #[event]
    struct CommunityUpdateEvent has store, drop {
        name: string::String,
        description: string::String,
        image: string::String,
        display_name: string::String,
        bid: u64,
        user_kid: u64,
        timestamp: u64,
    }
 */
const community_update_event_schema = z.object({
    name: z.string(),
    description: z.string(),
    image: z.string(),
    display_name: z.string(),
    bid: z.string().transform((p) => parseInt(p)),
    user_kid: z.string().transform((p) => parseInt(p)),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p))
})

/**
 * #[event]
    struct UserNameReclaimed has store, drop {
        username: string::String,
        old_owner_address: address,
        timestamp: u64
    }
 */
const username_reclaimed_event_schema = z.object({
    username: z.string(),
    old_owner_address: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p))
})

/**
 * struct AccountDeleteEvent has store, drop {
        user_kid: u64,
        user_address: address,
        timestamp: u64,
    }
 */
const account_delete_event_schema = z.object({
    user_kid: z.string().transform((p) => parseInt(p)),
    user_address: z.string(),
    timestamp: z.string().transform(p => `${p}000`).transform((p) => parseInt(p)).transform((p) => new Date(p))
})

const schema = {
    account_create_event_schema,
    delegate_create_event_schema,
    delegate_remove_event_schema,
    account_follow_event_schema,
    account_unfollow_event_schema,
    reaction_create_event_schema,
    reaction_remove_event_schema,
    publication_create_event_schema,
    publication_remove_event_schema,
    username_registration_event_schema,
    profile_update_event_schema,
    reaction_create_event_with_ref,
    publication_create_with_ref_event_schema,
    publication_remove_with_ref_event_schema,
    reaction_remove_event_with_ref,
    community_registered_event_schema,
    member_join_event_schema,
    membership_change_event_schema,
    membership_delete_event_schema,
    membership_reclaim_event_schema,
    community_update_event_schema,
    account_delete_event_schema,
    username_reclaimed_event_schema
}


export default schema
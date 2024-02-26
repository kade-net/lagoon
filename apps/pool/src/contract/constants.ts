

export const MODULE_ADDRESS = '0x809001fa9030e21dbe72a45291ddf227610e9c228025c8d93670ddd894f4141d'

export const ACCOUNT_RESOURCE_ADDRESS = '0x3859907505843da95c7171838d9233c29268140c26ef4c9c487af52847fe58b9';

export const PUBLICATION_RESOURCE_ADDRESS = '0x5ea08b646aae75a8512b78e6a163dda14da8eb89c5ed4cc63e43b6c84e86b64c'

export const USERNAME_RESOURCE_ADDRESS = '0xd996c8fa72572b43f809d46f372adf738c8c9b644c970d8e1f92b7652ef5983b'

export const ACCOUNT_CONTRACT = `${MODULE_ADDRESS}::accounts`

export const PUBLICATIONS_CONTRACT = `${MODULE_ADDRESS}::publications`

export const USERNAME_CONTRACT = `${MODULE_ADDRESS}::usernames`

export const ACCOUNT_EVENTS = {
    account_create_events: 'account_creation_events',
    delegate_creation_events: 'delegate_creation_events',
    delegate_remove_events: 'delegate_remove_events',
    account_follow_events: 'account_follow_events',
    account_unfollow_events: 'account_unfollow_events',
    profile_update_events: 'profile_update_events'
} as const

export const PUBLICATION_EVENTS = {
    publication_create_events: 'publication_create_events',
    publication_remove_events: 'publication_remove_events',
    comment_create_events: 'comment_create_events',
    comment_remove_events: 'comment_remove_events',
    quote_create_events: 'quote_create_events',
    quote_remove_events: 'quote_remove_events',
    reaction_create_events: 'reaction_creation_events',
    reaction_remove_events: 'reaction_remove_events',
    repost_create_events: 'repost_create_events',
    repost_remove_events: 'repost_remove_events',
} as const

export const USERNAME_EVENTS = {
    registration_events: 'registration_events'
} as const
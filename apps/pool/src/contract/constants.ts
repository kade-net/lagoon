

export const MODULE_ADDRESS = '0xcf00cd2fc17a06f9bf95a50c65d61e8d2f8f826eefa8d95dd68dbebf1bcaa432'

export const ACCOUNT_RESOURCE_ADDRESS = '0x9ff291c4a30c608e61464c54d2e5d33f0422271e2ca7caa15b29b27e67d3acae';

export const PUBLICATION_RESOURCE_ADDRESS = '0x9170f6470eea658d006d48afbcff05f49dc9a6d0fb3ecccabbb84c085a220ceb'

export const ACCOUNT_CONTRACT = `${MODULE_ADDRESS}::accounts`

export const PUBLICATIONS_CONTRACT = `${MODULE_ADDRESS}::publications`

export const ACCOUNT_EVENTS = {
    account_create_events: 'account_creation_events',
    delegate_creation_events: 'delegate_creation_events',
    delegate_remove_events: 'delegate_remove_events',
    account_follow_events: 'account_follow_events',
    account_unfollow_events: 'account_unfollow_events',
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
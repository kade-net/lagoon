import { ProcessMonitor } from "./monitor";

export type EVENT_NAMES = 'RegisterUsernameEvent' |
    'AccountCreateEvent' |
    'DelegateCreateEvent' |
    'DelegateRemoveEvent' |
    'AccountFollowEvent' |
    'AccountUnFollowEvent' |
    'ProfileUpdateEvent' |
    'PublicationCreate' |
    'PublicationRemove' |
    'PublicationCreateWithRef' |
    'PublicationRemoveWithRef' |
    'ReactionRemoveEventWithRef' |
    'ReactionCreateEventWithRef' |
    'ReactionCreateEvent' |
    'ReactionRemoveEvent';

export abstract class ProcessorPlugin {
    abstract name(): EVENT_NAMES 
    abstract process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string): Promise<void>
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
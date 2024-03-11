import { ProcessorPlugin } from "../replicate-worker/helpers";
import { ProcessMonitor } from "../replicate-worker/monitor";
import { AccountCreatePlugin, AccountFollowPlugin, AccountUnFollowPlugin, DelegateCreatePlugin, DelegateRemovePlugin, ProfileUpdatePlugin } from "../replicate-worker/plugins/accounts";
import { CommentCreateEventPlugin, CommentRemoveEventPlugin, PublicationCreateEventPlugin, PublicationRemoveEventPlugin, QuoteCreateEventPlugin, QuoteRemoveEventPlugin, ReactionCreateEventPlugin, ReactionRemoveEventPlugin, RepostCreateEventPlugin } from "../replicate-worker/plugins/publications";
import { RegisterUsernamePlugin } from "../replicate-worker/plugins/usernames";
import {z} from 'zod';
import { setUnkownError } from "./errors";

export const LagoonTypeSchema = z.union([
    z.literal("schema_error"),
    z.literal("pg_error"),
    z.literal("unkown_error"),
    z.literal("item_not_exist_error")
]);

export interface LagoonError {
    sequence_number: string,
    code: string,
    type: z.infer<typeof LagoonTypeSchema>
    id: number
}

export const interfaceErrorSchema = z.object({
    sequence_number: z.string(),
    code: z.string(),
    type: LagoonTypeSchema,
    id: z.number()
})

export function getPlugin(type: string): ProcessorPlugin | undefined {
    if (type === `RegisterUsernameEvent`) {
        return new RegisterUsernamePlugin();
    } else if (type === 'AccountCreateEvent') {
        return new AccountCreatePlugin();
    } else if (type === 'DelegateCreateEvent') {
        return new DelegateCreatePlugin();
    } else if (type === 'DelegateRemoveEvent') {
        return new DelegateRemovePlugin();
    } else if (type === 'AccountFollowEvent') {
        return new AccountFollowPlugin();
    } else if (type === 'AccountUnFollowEvent') {
        return new AccountUnFollowPlugin();
    } else if (type == 'ProfileUpdateEvent') {
        return new ProfileUpdatePlugin();
    } else if (type === 'PublicationCreate') {
        return new PublicationCreateEventPlugin();
    } else if (type === 'PublicationRemove') {
        return new PublicationRemoveEventPlugin();
    } else if (type === 'CommentCreateEvent') {
        return new CommentCreateEventPlugin();
    } else if (type === 'CommentRemoveEvent') {
        return new CommentRemoveEventPlugin();
    } else if (type === 'RepostCreateEvent') {
        return new RepostCreateEventPlugin();
    } else if (type === 'RepostRemoveEvent') {
        return new RepostCreateEventPlugin();
    } else if (type === 'QuoteCreateEvent') {
        return new QuoteCreateEventPlugin();
    } else if (type === 'QuoteRemoveEvent') {
        return new QuoteRemoveEventPlugin();
    } else if (type === 'ReactionCreateEvent') {
        return new ReactionCreateEventPlugin();
    } else if (type == 'ReactionRemoveEvent') {
        return new ReactionRemoveEventPlugin();
    }
}


/**
 * 
 * @param event The event stored in the key value store
 * @param monitor instance of process monitor
 * @param sequenceNumber The sequence number of the event that caused the event
 * @returns whether or not operation retried successfully
 */
export async function retry(event: string | undefined, monitor: ProcessMonitor, sequenceNumber: string): boolean {
    if (event) {
        try {
            // Parse event to get event type
            const data = JSON.parse(event);
            const type = data['type']
            const eventdata = JSON.parse(data['event']);
            let plugin = getPlugin(type);
            
            if (plugin) {
                await plugin.process(eventdata, monitor, sequenceNumber);
                monitor.setSuccess(sequenceNumber);
                return true;
            }
        } catch(err) {
            console.log("Error while retrying: ", err);
            setUnkownError(monitor, err, sequenceNumber);
            return false;
        }
    }
}
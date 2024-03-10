import { ProcessorPlugin } from "../replicate-worker/helpers";
import { ProcessMonitor } from "../replicate-worker/monitor";
import { AccountCreatePlugin, AccountFollowPlugin, AccountUnFollowPlugin, DelegateCreatePlugin, DelegateRemovePlugin, ProfileUpdatePlugin } from "../replicate-worker/plugins/accounts";
import { CommentCreateEventPlugin, CommentRemoveEventPlugin, PublicationCreateEventPlugin, PublicationRemoveEventPlugin, QuoteCreateEventPlugin, QuoteRemoveEventPlugin, ReactionCreateEventPlugin, ReactionRemoveEventPlugin, RepostCreateEventPlugin } from "../replicate-worker/plugins/publications";
import { RegisterUsernamePlugin } from "../replicate-worker/plugins/usernames";

export interface LagoonError {
    sequence_number: string,
    code: string,
    type: "schema_error" | "pg_error" | "unkown_error" | "item_not_exist_error"
}

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

export async function retry(event: string | undefined, monitor: ProcessMonitor, sequenceNumber: string) {
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
            }
        } catch(err) {
            console.log("Error while retrying: ", err);
            monitor.setFailed(sequenceNumber, `Error while retrying ${err}`);
        }
    }
}
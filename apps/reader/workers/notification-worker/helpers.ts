import {capture_event} from "posthog"
import {EVENT_NAMES} from "../replicate-worker/helpers";
import {NotificationProcessMonitor} from "./monitor";

export enum NotificationEvents {
  REACTION_EVENT= "reaction",
  ACCOUNT_EVENT= "follow",
  PUBLICATION_EVENT= "publication"
}

interface REACTION_EVENT {
  type: string,
  reaction_type: number,
  user_kid: number,
  kid: number,
  publication_ref: string
}

interface ACCOUNT_EVENT {
  type: string,
  user_kid: number,
  following_kid: number
}

interface PUBLICATION_EVENT {
  type: string,
  publication_type: number,
  user_kid: number,
  publication_ref: string,
  publication_id: number
}

const PostHogNotificationAppID = 'kade-notifications';

export class PostHogNotifications {
  send(event_type: string, data: ACCOUNT_EVENT | PUBLICATION_EVENT | REACTION_EVENT) {
    try {
      capture_event(PostHogNotificationAppID, "notification", data);
      console.log("Notification Sent");
    } catch(e) {
      console.log("I could not send notification");
      console.log(e);
    }
  }
}

export abstract class NotificationProcessorPlugin {
    abstract name(): EVENT_NAMES 
    abstract process(event: Record<string, any>, monitor: NotificationProcessMonitor, sequence_number: string, signature: string, postHogNotifier: PostHogNotifications): Promise<void>
}

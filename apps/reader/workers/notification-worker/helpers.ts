import {capture_event} from "posthog"
import {EVENT_NAMES} from "../replicate-worker/helpers";
import {NotificationProcessMonitor} from "./monitor";

interface ACCOUNT_EVENT {
  user_address: string,
  following_address: string
}

interface PUBLICATION_EVENT {
  user_address: string,
  publication_ref: string,
  publication_id: number
}

const PostHogNotificationAppID = 'kade-notifications';

export class PostHogNotifications {
  send(event_type: string, data: ACCOUNT_EVENT | PUBLICATION_EVENT) {
    try {
      capture_event(PostHogNotificationAppID, "notification", data);
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

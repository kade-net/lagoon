import schema from "../../../schema";
import {EVENT_NAMES} from "../../replicate-worker/helpers";
import {NotificationProcessorPlugin, sendNotificationToPostHog} from "../helpers";
import {NotificationProcessMonitor} from "../monitor";

export class FollowNotificationPlugin extends NotificationProcessorPlugin {
  name(): EVENT_NAMES {
    return "AccountFollowEvent"
  }
  async process(event: Record<string, any>, monitor: NotificationProcessMonitor, sequence_number: string, signature: string): Promise<void> {
    const parsed = schema.account_follow_event_schema.safeParse(event);

    if (!parsed.success) {
      monitor.setPosthogFailed(sequence_number, parsed.error);
    } else {
      const data = parsed.data;

      try {
        let notificationData = {
          user_address: data.user_kid,
          following_address: data.follower_kid
        };
       sendNotificationToPostHog("follow", notificationData); 
      } catch(e) {
        monitor.setPosthogFailed(sequence_number, {error: e})
      }
    }
  }
}

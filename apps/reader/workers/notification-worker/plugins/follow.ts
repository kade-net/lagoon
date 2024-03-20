import schema from "../../../schema";
import {EVENT_NAMES} from "../../replicate-worker/helpers";
import {NotificationProcessorPlugin, PostHogNotifications} from "../helpers";
import {NotificationProcessMonitor} from "../monitor";

export class FollowNotificationPlugin extends NotificationProcessorPlugin {
  name(): EVENT_NAMES {
    return "AccountFollowEvent"
  }
  async process(event: Record<string, any>, monitor: NotificationProcessMonitor, sequence_number: string, signature: string, postHogNotifier: PostHogNotifications): Promise<void> {
    console.log("Processing A Follow Notification");
    const parsed = schema.account_follow_event_schema.safeParse(event);

    if (!parsed.success) {
      monitor.setPosthogFailed(sequence_number, parsed.error);
    } else {
      const data = parsed.data;
      console.log("FOLLOW DATA");
      console.log(data);

      try {
        let notificationData = {
          user_address: data.follower,
          following_address: data.following
        };
        console.log("Sending Event to posthog");

        postHogNotifier.send("follow", notificationData);
        monitor.setPosthogSuccess(sequence_number);
      } catch(e) {
        monitor.setPosthogFailed(sequence_number, {error: e})
      }
    }
  }
}

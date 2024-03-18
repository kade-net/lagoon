import schema from "../../../schema";
import {EVENT_NAMES, ProcessorPlugin} from "../../replicate-worker/helpers";
import {ProcessMonitor} from "../../replicate-worker/monitor";
import {sendNotificationToPostHog} from "../helpers";

export class FollowNotificationPlugin extends ProcessorPlugin {
  name(): EVENT_NAMES {
    return "AccountFollowEvent"
  }
  async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string): Promise<void> {
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

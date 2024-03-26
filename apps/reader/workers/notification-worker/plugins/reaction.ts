import schema from "../../../schema";
import {EVENT_NAMES} from "../../replicate-worker/helpers";
import {NotificationEvents, NotificationProcessorPlugin, PostHogNotifications} from "../helpers";
import {NotificationProcessMonitor} from "../monitor";

export class ReactionCreateNotificationPlugin extends NotificationProcessorPlugin {
  name(): EVENT_NAMES {
    return "ReactionCreateEventWithRef"
  }
  async process(event: Record<string, any>, monitor: NotificationProcessMonitor, sequence_number: string, signature: string, postHogNotifier: PostHogNotifications): Promise<void> {
    console.log("Processing A Reaction Creation Notification");
    const parsed = schema.reaction_create_event_with_ref.safeParse(event);

    if (!parsed.success) {
      monitor.setPosthogFailed(sequence_number, parsed.error);
    } else {
      const data = parsed.data;
      console.log("REACTION CREATE EVENT DATA");
      console.log(data);

      try {
        let reactionCreateData = {
          type: NotificationEvents.REACTION_EVENT,
          reaction_type: data.reaction,
          user_kid: data.user_kid,
          kid: data.kid,
          publication_ref: data.publication_ref
        };
        console.log("Sending Event to posthog", reactionCreateData);

        postHogNotifier.send("follow", reactionCreateData);
        monitor.setPosthogSuccess(sequence_number);
      } catch(e) {
        monitor.setPosthogFailed(sequence_number, {error: e})
      }
    }
  }
}

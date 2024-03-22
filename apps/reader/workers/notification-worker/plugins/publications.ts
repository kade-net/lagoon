import schema from "../../../schema";
import {EVENT_NAMES} from "../../replicate-worker/helpers";
import {NotificationProcessorPlugin, PostHogNotifications} from "../helpers";
import {NotificationProcessMonitor} from "../monitor";


export class PublicationCreateNotification extends NotificationProcessorPlugin {
  name(): EVENT_NAMES {
    return "PublicationCreateWithRef";
  }

  async process(event: Record<string, any>, monitor: NotificationProcessMonitor, sequence_number: string, signature: string, postHogNotifier: PostHogNotifications): Promise<void> {
    console.log("Processing Publication Create Notification");
    // Parse the data we need
    const parsed = schema.publication_create_with_ref_event_schema.safeParse(event);

    if (!parsed.success) {
      monitor.setPosthogFailed(sequence_number, parsed.error);
    } else {
      const data = parsed.data;
      console.log("PUBLICATION DATA");
      console.log(data);


      try {
        const notificationData = {
          type: "publication",
          publication_type: data.type,
          user_kid: data.user_kid,
          publication_ref: data.publication_ref,
          publication_id: data.kid 
        };
        
        console.log("Sending Notification");
        monitor.setPosthogSuccess(sequence_number);
        postHogNotifier.send(data.type.toString(), notificationData);
      } catch(e) {
        monitor.setPosthogFailed(sequence_number, {error: e});
      }
    }
  }
}

import {capture_event} from "posthog";
import schema from "../../../schema";
import {EVENT_NAMES, ProcessorPlugin} from "../../replicate-worker/helpers";
import {NotificationProcessorPlugin, sendNotificationToPostHog} from "../helpers";
import {NotificationProcessMonitor} from "../monitor";

type PublicationType = 'repost' | 'comment' | 'quote'; 

export class PublicationCreateNotification extends NotificationProcessorPlugin {
  name(): EVENT_NAMES {
    return "PublicationCreateWithRef";
  }

  async process(event: Record<string, any>, monitor: NotificationProcessMonitor, sequence_number: string, signature: string): Promise<void> {
    // Parse the data we need
    const parsed = schema.publication_create_with_ref_event_schema.safeParse(event);

    if (!parsed.success) {
      monitor.setPosthogFailed(sequence_number, parsed.error);
    } else {
      const data = parsed.data;

      function getTypeOfPublication(identifier: number): PublicationType | void{
        if (identifier === 2) {
          return 'quote';
        } else if (identifier === 3) {
          return 'comment';
        } else if (identifier === 4) {
          return 'repost';
        } 

        return undefined;
      }

      try {
       if (getTypeOfPublication(data.type)) {
         const notificationData = {
          user_address: data.user_kid,
          publication_ref: data.parent_ref,
          publication_id: data.kid
        }

        sendNotificationToPostHog(getTypeOfPublication(data.type)!, notificationData);
       } 
      } catch(e) {
        monitor.setPosthogFailed(sequence_number, {error: e});
      }
    }
  }
}

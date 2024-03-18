import {capture_event} from "posthog"
import {PostHogAppID} from "../../posthog/events"

interface ACCOUNT_EVENT {
  user_address: number,
  following_address: number
}

interface PUBLICATION_EVENT {
  user_address: number,
  publication_ref: string,
  publication_id: number
}

export function sendNotificationToPostHog(event_type: string, data: ACCOUNT_EVENT | PUBLICATION_EVENT) {
  try {
    capture_event(PostHogAppID, "notification", data);
  } catch(e) {
    console.log("I could not send notification for some reason");
    console.log(e);
  }
}

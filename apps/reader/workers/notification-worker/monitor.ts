import {capture_event} from "posthog";
import {Lama} from "../../db/lama";
import {PostHogAppID, PosthogEvents} from "../../posthog/events";

export class NotificationProcessMonitor {
  last_read: Lama

  constructor(last_read: Lama) {
    this.last_read = last_read;
  }

  static async init() {
    const db = await Lama.init("last_notified");

    return new NotificationProcessMonitor(db);
  }

  updateLastNotified(value: string) {
    return this.last_read.put("last_notified", value);
  }

  setPosthogFailed(sequence_number: string, payload: Record<string, any>) {
    capture_event(PostHogAppID, PosthogEvents.FAILED, {payload, sequence_number});
  }

  setPosthogSuccess(sequence_number: string) {
    capture_event(PostHogAppID, PosthogEvents.SUCCESS, {sequence_number});
  }

}

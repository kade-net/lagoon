import 'dotenv/config'
import dataProcessor, { monitor } from "."
import { capture_event } from 'posthog'
import { PostHogAppId, PostHogEvents } from '../../posthog/events'


try {
    const last_read = await monitor.last_read.get("last_read")
    const _last_read = last_read ? parseInt(last_read) : 0
    const value = Number.isNaN(_last_read) ? 0 : _last_read
    capture_event(PostHogAppId, PostHogEvents.START_REPLICATE_WORKER, {
        message: "Last read::",
        value: value
    });
    await dataProcessor.process(value)
    // TODO: add a prune worker to remove old data
}
catch (e) {
    capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_ERROR, {
        message: "Something went wrong while processing data:",
        data: e
    });
}
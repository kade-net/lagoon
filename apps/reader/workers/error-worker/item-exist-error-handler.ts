import { sleep } from "../replicate-worker/helpers";
import { InterfaceError, KadeItems } from "./errors";
import { checkIfItemExistsAndRetryIfExists, retry } from "./helpers";
import { ProcessMonitor } from "../replicate-worker/monitor";
import { capture_event } from "posthog";
import { PostHogAppId, PostHogEvents } from "../../posthog/events";

export async function handleItemNotExistError(err: InterfaceError, eventData: string, monitor: ProcessMonitor, sequence_number: string) {
    try {
        // Wait for some time
        await sleep(60_000);

        // Check if item exists
        const item = err.code;
        const id = err.id;
        checkIfItemExistsAndRetryIfExists(item, id, eventData, monitor, sequence_number);
    } catch(err) {
        console.log("Could Not Handle Item Not Exist Error")
        capture_event(PostHogAppId, PostHogEvents.ERROR_WORKER_ERROR, {
            message: "Could Not Handle Item Not Exist Error",
            error: err
        })
    }
}

export { checkIfItemExistsAndRetryIfExists };

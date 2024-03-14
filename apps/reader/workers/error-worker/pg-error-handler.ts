import { capture_event } from "posthog";
import { LevelDB } from "../../db";
import { sleep } from "../replicate-worker/helpers";
import { ProcessMonitor } from "../replicate-worker/monitor";
import { PostgresErrors, parsePostgresErrorType } from "./classify-error";
import { InterfaceError } from "./errors";
import { retry } from "./helpers";
import { checkIfItemExistsAndRetryIfExists } from "./item-exist-error-handler";
import { PostHogAppId, PostHogEvents } from "../../posthog/events";

async function retryXTimes(x: number, eventData: string, monitor: ProcessMonitor, sequence_number: string) {
    let tries = 0;
    let success = false;

    while (success === false && tries < x) {
        await sleep(60_000);
        success = await retry(eventData, monitor, sequence_number);
        tries += 1;
    } 
}

export async function handlePgError(error: InterfaceError, eventData: string, monitor: ProcessMonitor, sequence_number: string, db: LevelDB) {
    try {
        // get type of postgres error
        const errorType = parsePostgresErrorType(error.code);

        if (errorType === PostgresErrors.ConnectionError) {
            retryXTimes(3, eventData, monitor, sequence_number);
        } else if (errorType === PostgresErrors.InsufficientResources) {
            retryXTimes(3, eventData, monitor, sequence_number);
        } else if (errorType === PostgresErrors.ProgramLimitExceeded) {
            // This is an error in code
            monitor.failed.delete(sequence_number);
            capture_event(PostHogAppId, PostHogEvents.ERROR_WORKER_ERROR, {
                message: "CHECK THE CODE THERE IS A QUERY THAT IS TOO COMPLEX",
                event: eventData
            })
        } else if(errorType === PostgresErrors.UniqueViolation) {
            // Delete event since it already occured
            monitor.failed.delete(sequence_number);
            db._db.delete(sequence_number);
        } else if(errorType === PostgresErrors.NotNullViolation) {
            // Some data was missing in the event delete it from monitor for now
            capture_event(PostHogAppId, PostHogEvents.ERROR_WORKER_ERROR, {
                message: "SOME DATA IS MISSING FROM THIS EVENT",
                event: eventData
            })
        } else if(errorType === PostgresErrors.DataExceptionError) {
            // Some data was missing in the event delete it from monitor for now
            capture_event(PostHogAppId, PostHogEvents.ERROR_WORKER_ERROR, {
                message: "BAD DATA SENT IN EVENT",
                event: eventData
            })
        } else if(errorType === PostgresErrors.InvalidCursorTransactionState) {
            capture_event(PostHogAppId, PostHogEvents.ERROR_WORKER_ERROR, {
                message: "CURSOR NOT IN VALID STATE",
                event: eventData
            })
        } else if (errorType === PostgresErrors.IntegrityViolation) {
            // Whaterver it's trying to add has already been done
            monitor.failed.delete(sequence_number);
            db._db.delete(sequence_number);
        } else if (errorType === PostgresErrors.ForeignKeyViolation) {
            // Wait abit
            await sleep(60_000);

            const item = error.item;
            const id = error.id;
            // Check if item exists and retry if exists
            checkIfItemExistsAndRetryIfExists(item, id, eventData, monitor, sequence_number);
        }else {
            capture_event(PostHogAppId, PostHogEvents.ERROR_WORKER_ERROR, {
                message: "OTHER ERROR",
                event: eventData
            })
        }
    } catch(err) {
        capture_event(PostHogAppId, PostHogEvents.ERROR_WORKER_ERROR, {
            message: "Could Not Handle Pg Error",
            event: err
        })
    }
}
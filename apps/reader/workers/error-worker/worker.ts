import { capture_event } from "posthog";
import { LevelDB } from "../../db";
import { Lama, LamaReader } from "../../db/lama";
import { sleep } from "../replicate-worker/helpers";
import { ProcessMonitor } from "../replicate-worker/monitor";
import { PostgresErrors, parsePostgresErrorType } from "./classify-error";
import { ErrorProcessor } from "./error-processor";
import { InterfaceError } from "./errors";
import { interfaceErrorSchema, retry } from "./helpers";
import { PostHogAppId, PostHogEvents } from "../../posthog/events";

export class ErrorWorker {
    reader: LamaReader
    db: LevelDB
    monitor: ProcessMonitor
    lama: Lama
    processor: ErrorProcessor

    constructor(monitor: ProcessMonitor, lastKey: string, db: LevelDB, lama: Lama, processor: ErrorProcessor) {
        this.reader = new LamaReader(monitor.failed.dbi, monitor.failed.env, lastKey);
        this.db = db;
        this.monitor = monitor;
        this.lama = lama;
        this.processor = processor;
    }

    async run() {
        this.reader.on('data', async (data) => {
            try {
                const event = data.toString();

                // If event is json parse it
                if (event.includes("{")) {
                    const data = JSON.parse(event);

                    // Some how get the key I need
                    const key = data['key'];

                    // Get error data using the key
                    const errorData = this.monitor.failed.get(key);
                    const error = interfaceErrorSchema.safeParse(errorData);

                    if (!error.success) {
                        throw "Could Not Parse Event"
                    }

                    if (error.success) {
                        const data = error.data;
                        const interfaceerror = new InterfaceError(data.sequence_number, data.code, data.type, data.id, data.item);
                        await this.processor.processError(interfaceerror, key)

                        // Record that I've dealt with error
                        this.lama.put("lastRead", key);
                    }
                    // Record that event has been dealt with
                    capture_event(PostHogAppId, PostHogEvents.ERROR_WORKER_ERROR, {
                        message: "Could Not Get Event Data From Lama",
                        key,
                    })
                    this.lama.put("lastRead", key);
                }
            } catch (err) {
                capture_event(PostHogAppId, PostHogEvents.ERROR_WORKER_ERROR, {
                    message: "Error At Error Worker",
                    error: err,
                })
            }
        });
    }
}
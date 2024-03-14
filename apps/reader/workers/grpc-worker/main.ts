import "dotenv/config"
import _ from "lodash"
const { isUndefined } = _
import { LevelDB } from "../../db"
import { ReadProcessor } from "./read.processor"
import { Worker } from "./worker"
import { capture_event } from "posthog"
import { PostHogAppId, PostHogEvents } from "../../posthog/events"


try {
    const db = await LevelDB.init()
    const worker = new Worker(
        process.env.INDEXER_API_KEY!,
        db,
        new ReadProcessor()
    )
    const starting = process.env.STARTING_VERSION!
    const parsed = starting ? parseInt(starting) : undefined
    if (Number.isNaN(parsed) || isUndefined(parsed)) {
        throw new Error("Invalid starting version")
    }
    const v = await db.getLatestVersion()
    capture_event(PostHogAppId, PostHogEvents.START_GRPC_WORKER, {
        message: "Starting worker with version",
        version: v.toString()
    });
    await worker.run(BigInt(parsed))
}
catch (e) {
    capture_event(PostHogAppId, PostHogEvents.GRPC_WORKER_ERROR, {
        message: "Something went wrong while processing data",
        error: e,
    });
}
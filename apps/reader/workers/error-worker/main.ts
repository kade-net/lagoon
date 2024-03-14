import { capture_event } from "posthog";
import { LevelDB } from "../../db";
import { Lama } from "../../db/lama";
import { ProcessMonitor } from "../replicate-worker/monitor";
import { ErrorProcessor } from "./error-processor";
import { ErrorWorker } from "./worker";
import { PostHogAppId, PostHogEvents } from "../../posthog/events";

try {
    const levelDB = await LevelDB.init();
    const monitor = await ProcessMonitor.init();
    const errorLama = await Lama.init("lastCheckedError");
    const key = await errorLama.get("lastRead");

    const errorProcessor = new ErrorProcessor(errorLama, monitor, levelDB);
    const errorWorker = new ErrorWorker(monitor, key || "000000000", levelDB, errorLama, errorProcessor);
    await errorWorker.run();
} catch(err) {
    capture_event(PostHogAppId, PostHogEvents.ERROR_WORKER_ERROR, {
        message: "Error While Running Error Worker",
        error: err
    })
}
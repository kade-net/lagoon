import { capture_event } from "posthog";
import { Lama } from "../../db/lama";
import { PostHogAppID, PosthogEvents } from "../../posthog/events";



export class ProcessMonitor {
    last_read: Lama
    failed: Lama
    success: Lama

    constructor(last_read: Lama, failed: Lama, success: Lama) {
        this.last_read = last_read
        this.failed = failed
        this.success = success
    }

    static async init() {
        const db = await Lama.init("last_read")
        const failed = await Lama.init("failed")
        const success = await Lama.init("success")

        return new ProcessMonitor(db, failed, success)
    }

    updateLastRead(value: string) {
        return this.last_read.put("last_read", value)
    }

    setFailed(sequence_number: string, payload: string) {
        return this.failed.put(sequence_number, payload)
    }

    setPosthogFailed(sequence_number: string, payload: Record<string, any>) {
        capture_event(PostHogAppID, PosthogEvents.FAILED, {payload, sequence_number});
    }

    setSuccess(sequence_number: string) {
        return this.success.put(sequence_number, "success")
    }

    setPosthogSuccess(sequence_number: string) {
        capture_event(PostHogAppID, PosthogEvents.SUCCESS, {sequence_number});
    }
}
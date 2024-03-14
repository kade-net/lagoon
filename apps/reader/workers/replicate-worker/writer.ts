import lmdb from "node-lmdb"
import { LamaReader } from "../../db/lama";
import { ProcessorPlugin, sleep } from "./helpers";
import { ProcessMonitor } from "./monitor";
import _ from "lodash";
import { capture_event } from "posthog";
import { PostHogAppId, PostHogEvents } from "../../posthog/events";
import { error } from "console";
const { isNull } = _



export class DataProcessor {

    private dbi: lmdb.Dbi
    private env: lmdb.Env
    private registeredPlugins: ProcessorPlugin[] = []
    private monitor: ProcessMonitor


    constructor(dbi: lmdb.Dbi, env: lmdb.Env, monitor: ProcessMonitor) {
        this.dbi = dbi
        this.env = env
        this.monitor = monitor
    }

    async process(_last_read?: number) {
        capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_WRITER, {
            message: "Processing data",
            last_read: _last_read
        });
        let last_read = "000000000"

        if (_last_read) {
            const s = `000000000${_last_read}`
            last_read = s.substring(s.length - 9)
        }
        capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_WRITER, {
            message: "Last read::",
            last_read: _last_read
        });

        const txn = this.env.beginTxn({
            readOnly: true
        })
        const cursor = new lmdb.Cursor(txn, this.dbi)
        const atRange = last_read == "000000000" ? {} : cursor.goToRange(last_read)
        capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_WRITER, {
            message: "At Range::",
            last_read: atRange
        });
        if (!atRange) {
            capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_WRITER, {
                message: "No more data",
            })
            cursor.close()
            txn.commit()
            await sleep(60_000)
            capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_WRITER, {
                message: "resuming",
            })
            await this.process(parseInt(last_read))
            return
        }

        let key, value: Buffer | null;

        while ((key = cursor.goToNext()) !== null) {
            capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_WRITER, {
                message: "key::",
                key
            })
            value = cursor.getCurrentBinary()
            if (value && !isNull(value)) {
                const data = JSON.parse(value.toString())
                const event_type = data.type

                const event_data = JSON.parse(data.event)
                const chosenPlugin = this.registeredPlugins.find(p => p.name() === event_type)

                if (chosenPlugin) {
                    try {

                        await chosenPlugin.process(event_data, this.monitor, key)
                        capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_WRITER, {
                            message: "Data processed successfully",
                        })
                    }
                    catch (e) {
                        capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_WRITER_ERROR, {
                            message: "Something went wrong while processing data::",
                            error: e
                        })
                    }
                }


                last_read = key
            }
        }

        cursor.close()
        txn.commit()
        await this.monitor.updateLastRead(last_read)
        await sleep(60_000)
        capture_event(PostHogAppId, PostHogEvents.REPLICATE_WORKER_WRITER, {
            message: "resuming",
        })
        await this.process(parseInt(last_read))
    }

    registerPlugin(plugin: ProcessorPlugin) {
        this.registeredPlugins.push(plugin)
    }

}


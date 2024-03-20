import lmdb from "node-lmdb"
import _ from "lodash";
import { IngressPlugin } from "../plugins/definitions";
import { sleep } from "../../workers/replicate-worker/helpers";
const { isNull } = _
import tunnel, { events } from 'tunnel'



export class DataProcessor {

    private dbi: lmdb.Dbi
    private env: lmdb.Env
    private registeredPlugins: IngressPlugin[] = []


    constructor(dbi: lmdb.Dbi, env: lmdb.Env) {
        this.dbi = dbi
        this.env = env
    }

    async process(call: tunnel.ServerWritableStream<events.EventsRequest, events.Event>, _last_read?: number) {
        console.log("Processing data", _last_read)
        let last_read = "000000000"

        if (_last_read) {
            const s = `000000000${_last_read}`
            last_read = s.substring(s.length - 9)
        }
        console.log("Last read::", last_read)

        const txn = this.env.beginTxn({
            readOnly: true
        })
        const cursor = new lmdb.Cursor(txn, this.dbi)
        const atRange = last_read == "000000000" ? {} : cursor.goToRange(last_read)
        console.log("At Range::", atRange)
        if (!atRange) {
            console.log("No more data")
            cursor.close()
            txn.commit()
            await sleep(60_000)
            console.log("resuming")
            call.end()
            return
        }

        let key, value: Buffer | null;

        while ((key = cursor.goToNext()) !== null) {
            console.log("key::", key)
            value = cursor.getCurrentBinary()
            if (value && !isNull(value)) {
                const data = JSON.parse(value.toString())
                const event_type = data.type
                const requestedEventType = call.request.toObject().event_type
                if ((requestedEventType?.length ?? 0) > 3 && event_type !== requestedEventType) {
                    console.log("Skipping event::", event_type)
                    continue
                }
                const signature = data.signature
                const event_data = JSON.parse(data.event)
                const chosenPlugin = this.registeredPlugins.find(p => p.name() === event_type)

                if (chosenPlugin) {
                    try {

                        await chosenPlugin.process(call, event_data, key)
                    }
                    catch (e) {
                        console.log("Something went wrong while processing data::", e)
                    }
                }


                last_read = key
            }
        }

        cursor.close()
        txn.commit()
        await sleep(60_000)
        console.log("resuming")
        await this.process(call, parseInt(last_read))
    }

    registerPlugin(plugin: IngressPlugin) {
        this.registeredPlugins.push(plugin)
    }

}


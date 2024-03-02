import lmdb from "node-lmdb"
import { LamaReader } from "../../db/lama";
import { ProcessorPlugin, sleep } from "./helpers";




export class DataProcessor {

    private dbi: lmdb.Dbi
    private env: lmdb.Env
    private registeredPlugins: ProcessorPlugin[] = []



    constructor(dbi: lmdb.Dbi, env: lmdb.Env) {
        this.dbi = dbi
        this.env = env
    }

    async process(_last_read?: number) {
        let last_read = "000000000"

        if (_last_read) {
            const s = `000000000${_last_read}`
            last_read = s.substring(s.length - 9)
        }

        const reader = new LamaReader(this.dbi, this.env, last_read)

        reader.on('data', async (data) => {
            const ev = data.toString()
            if (ev.includes("{")) {
                const data = JSON.parse(ev)

                last_read = data.key
                const chosenPlugin = this.registeredPlugins.find(p => p.name() === data.value.type)
                if (chosenPlugin && data.value.event) {
                    await chosenPlugin.process(JSON.parse(data.value.event))
                }
            }
        })

        reader.on('end', async () => {
            console.log("ended")

            // sleep for 1 minute
            await sleep(60_000)
            console.log("resuming")
            this.process(parseInt(last_read))
        })
    }

    registerPlugin(plugin: ProcessorPlugin) {
        this.registeredPlugins.push(plugin)
    }

}


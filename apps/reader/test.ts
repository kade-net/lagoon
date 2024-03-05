import { EventProcessor, LevelDB } from "./db";
import { Lama, LamaReader } from "./db/lama";
import { Rockie } from "./db/rockie";
import { DataProcessor } from "./workers/replicate-worker/writer";
import { ReadProcessor } from "./workers/grpc-worker/read.processor";
import { Worker } from "./workers/grpc-worker/worker";
import { ProcessorPlugin, sleep } from "./workers/replicate-worker/helpers";
import { ProcessMonitor } from "./workers/replicate-worker/monitor";


const levelDB = await LevelDB.init() 

const monitor = await ProcessMonitor.init()


const reader = new LamaReader(levelDB._db.dbi, levelDB._db.env)

reader.on("data", async (data) => {
    const ev = data.toString()
    console.log("ev::", ev)
    // if (ev.includes("{")) {
    //     // console.log("ev::", ev)
    //     const data = JSON.parse(ev)
    //     if (["DelegateCreateEvent", "AccountCreateEvent"].includes(data.value.type)) {
    //         if (data.value.type === "DelegateCreateEvent") {
    //             await sleep(1000)
    //         } else {
    //             await sleep(10_000)
    //         }
    //         console.log("data::", data)
    //     }
    // }
})

// const processor = new DataProcessor(levelDB._db.dbi, levelDB._db.env)

// class ProfileUpdateEventPlugin extends ProcessorPlugin {
//     name(): string {
//         return "ProfileUpdateEvent"
//     }
//     async process(event: Record<string, any>): Promise<void> {
//         console.log(event)
//     }

// }

// processor.registerPlugin(new ProfileUpdateEventPlugin())

// await processor.process()



// const db = new LevelDB()

// class WriteProcessor extends EventProcessor {
//     async process(event: Record<string, any>): Promise<void> {
//         console.log(event)
//     }
// }

// const writeProcessor = new WriteProcessor()
// await db.process(writeProcessor, 0)
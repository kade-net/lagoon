import { EventProcessor, LevelDB } from "./db";
import { Lama, LamaReader } from "./db/lama";
import { Rockie } from "./db/rockie";
import { DataProcessor } from "./workers/replicate-worker/writer";
import { ReadProcessor } from "./workers/grpc-worker/read.processor";
import { Worker } from "./workers/grpc-worker/worker";
import { ProcessorPlugin } from "./workers/replicate-worker/helpers";


const levelDB = await LevelDB.init()


const processor = new DataProcessor(levelDB._db.dbi, levelDB._db.env)

class ProfileUpdateEventPlugin extends ProcessorPlugin {
    name(): string {
        return "ProfileUpdateEvent"
    }
    async process(event: Record<string, any>): Promise<void> {
        console.log(event)
    }

}

processor.registerPlugin(new ProfileUpdateEventPlugin())

await processor.process()



// const db = new LevelDB()

// class WriteProcessor extends EventProcessor {
//     async process(event: Record<string, any>): Promise<void> {
//         console.log(event)
//     }
// }

// const writeProcessor = new WriteProcessor()
// await db.process(writeProcessor, 0)
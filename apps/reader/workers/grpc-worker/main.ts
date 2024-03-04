import "dotenv/config"
import _ from "lodash"
const { isUndefined } = _
import { LevelDB } from "../../db"
import { ReadProcessor } from "./read.processor"
import { Worker } from "./worker";


async function main() {
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
    console.log("Starting worker with version", parsed)
    await worker.run(BigInt(parsed))
}

try {
    main();
}
catch (e) {
    if (e instanceof Error) {
        if (e.message === "RESOURCE_EXHAUSTED") {
            main();
        } else {
            console.log("Something went wrong while processing data", e);
        }
    } else {
        console.log("Something went wrong while processing data", e);
    }
}

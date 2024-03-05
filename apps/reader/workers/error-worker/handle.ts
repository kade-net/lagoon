import { LevelDB } from "../../db";
import { LamaReader } from "../../db/lama";
import { ProcessMonitor } from "../replicate-worker/monitor";

// Get access to the k-v store that's storing events
const levelDB = LevelDB.init();

// Get a monitior
const monitior = await ProcessMonitor.init();;

// Read from the lama
const reader = new LamaReader(monitior.failed.dbi, monitior.failed.env);

reader.on("data", async (data) => {
    const entry = data.toString();
    console.log(`Entry is ${entry}`); 
    if (entry.includes("{")) {
        // console.log("ev::", ev)
        const data = JSON.parse(entry)
        console.log(data);

        // // Handle the different events
        // if () {

        // }

        // if (["DelegateCreateEvent", "AccountCreateEvent"].includes(data.value.type)) {
        //     if (data.value.type === "DelegateCreateEvent") {
        //         await sleep(1000)
        //     } else {
        //         await sleep(10_000)
        //     }
        //     console.log("data::", data)
        // }
    }
})



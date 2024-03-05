import { LevelDB } from "../../db";
import { LamaReader } from "../../db/lama";
import dataProcessor from "../replicate-worker";
import { sleep } from "../replicate-worker/helpers";
import { ProcessMonitor } from "../replicate-worker/monitor";
import { RegisterUsernamePlugin } from "../replicate-worker/plugins/usernames";

const levelDB = await LevelDB.init();
const monitor = await ProcessMonitor.init();

const reader = new LamaReader(monitor.failed.dbi, monitor.failed.env);

reader.on('data', async (data) => {
    const event = data.toString();
    console.log(`event:: ${event}`); 

    // If event is json parse it
    if (event.includes("{")) {
        const data = JSON.parse(event);

        // Some how get the key I need
        const key = data['key'];

        // Get event using the key
        const eventData = await levelDB.get(key);

        // And maybe call processor again after some time
        await sleep(180_000);
        
        if (eventData['type'] === "RegisterUsernameEvent") {
            let plugin = new RegisterUsernamePlugin()
            plugin.process(eventData, monitor, levelDB.getSequenceNumber());
        }
    }
});
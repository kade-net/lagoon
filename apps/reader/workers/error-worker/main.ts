import { LevelDB } from "../../db";
import { Lama } from "../../db/lama";
import { ProcessMonitor } from "../replicate-worker/monitor";
import { ErrorWorker } from "./worker";

try {
    const levelDB = await LevelDB.init();
    const monitor = await ProcessMonitor.init();
    const errorLama = await Lama.init("lastCheckedError");
    const key = await errorLama.get("lastRead");

    const errorWorker = new ErrorWorker(monitor, key || "000000000", levelDB, errorLama);
    await errorWorker.run();
} catch(err) {
    console.log(`\nOHHH SHIT\n`);
    console.log(err);
}
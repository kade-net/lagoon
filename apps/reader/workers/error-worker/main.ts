import { LevelDB } from "../../db";
import { LamaReader } from "../../db/lama";
import dataProcessor from "../replicate-worker";
import { sleep } from "../replicate-worker/helpers";
import { ProcessMonitor } from "../replicate-worker/monitor";
import { RegisterUsernamePlugin } from "../replicate-worker/plugins/usernames";
import { PostgresErrors, parsePostgresErrorType } from "./classify_error";

const levelDB = await LevelDB.init();
const monitor = await ProcessMonitor.init();

const reader = new LamaReader(monitor.failed.dbi, monitor.failed.env);

reader.on('data', async (data) => {
    const event = data.toString();
    console.log(`event:: ${event}`); 

    // If event is json parse it
    if (event.includes("{")) {
        const data = JSON.parse(event);
        console.log(data);
        const postgresErrorType = parsePostgresErrorType(data)


        if(postgresErrorType === PostgresErrors.ConnectionError) {
            // retry
        } else if ([PostgresErrors.InsufficientResources, PostgresErrors.ProgramLimitExceeded, PostgresErrors.InvalidCursorTransactionState, PostgresErrors.OtherError].includes(postgresErrorType)) {
            // retry after a pause
        } else if ([PostgresErrors.ForeignKeyViolation, PostgresErrors.IntegrityViolation].includes(postgresErrorType)) {
            // retry after a pause
        } else if ([PostgresErrors.DataExceptionError, PostgresErrors.NotNullViolation].includes(postgresErrorType)) {
            // somehow get data again?
        } else if (postgresErrorType == PostgresErrors.UniqueViolation) {
            // ignore
        }

        // // Some how get the key I need
        // const key = data['key'];

        // // Get event using the key
        // const eventData = await levelDB.get(key);

        // // And maybe call processor again after some time
        // await sleep(180_000);
        
        // if (eventData['type'] === "RegisterUsernameEvent") {
        //     let plugin = new RegisterUsernamePlugin()
        //     plugin.process(eventData, monitor, levelDB.getSequenceNumber());
        // }
    }
});
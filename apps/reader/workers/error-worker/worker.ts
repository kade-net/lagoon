import { LevelDB } from "../../db";
import { Lama, LamaReader } from "../../db/lama";
import { sleep } from "../replicate-worker/helpers";
import { ProcessMonitor } from "../replicate-worker/monitor";
import { PostgresErrors, parsePostgresErrorType } from "./classify_error";
import { retry } from "./helpers";

export class ErrorWorker {
    reader: LamaReader
    db: LevelDB
    monitor: ProcessMonitor
    lama: Lama

    constructor(monitor: ProcessMonitor, lastKey: string, db: LevelDB, lama: Lama) {
        this.reader = new LamaReader(monitor.failed.dbi, monitor.failed.env, lastKey);
        this.db = db;
        this.monitor = monitor;
        this.lama = lama;
    }

    async run() {
        this.reader.on('data', async (data) => {
            const event = data.toString();
            console.log(`event:: ${event}`); 
        
            // If event is json parse it
            if (event.includes("{")) {
                const data = JSON.parse(event);
                console.log(data);
                const postgresErrorType = parsePostgresErrorType(data['value']);
                
                // Some how get the key I need
                const key = data['key'];
        
                // Get event using the key
                const eventData = await this.db.get(key);
        
                if(eventData) {
                    if (postgresErrorType === PostgresErrors.ConnectionError) {
                        // retry
                        await sleep(60_000);
                        await retry(eventData, this.monitor, key);
                    } else if ([PostgresErrors.InsufficientResources, PostgresErrors.ProgramLimitExceeded, PostgresErrors.InvalidCursorTransactionState, PostgresErrors.OtherError].includes(postgresErrorType)) {
                        // retry after a pause
                        await sleep(180_000);
                        await retry(eventData, this.monitor, key);
                    } else if ([PostgresErrors.ForeignKeyViolation, PostgresErrors.IntegrityViolation].includes(postgresErrorType)) {
                        // retry after a pause
                        await sleep(180_000);
                        await retry(eventData, this.monitor, key);
                    } else if ([PostgresErrors.DataExceptionError, PostgresErrors.NotNullViolation].includes(postgresErrorType)) {
                        // somehow get data again?
                    } else if (postgresErrorType == PostgresErrors.UniqueViolation) {
                        // ignore
                    }

                    // Record that I've dealt with error
                    this.lama.put("lastRead", key);
                }
            }
        });
    }
}
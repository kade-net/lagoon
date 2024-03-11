import { LevelDB } from "../../db";
import { Lama } from "../../db/lama";
import { sleep } from "../replicate-worker/helpers";
import { ProcessMonitor } from "../replicate-worker/monitor";
import { PostgresErrors, parsePostgresErrorType } from "./classify_error";
import { InterfaceError } from "./errors";
import { retry } from "./helpers";
import { handleItemNotExistError } from "./item_exist_error_handler";

export class ErrorProcessor {
    lama: Lama
    monitor: ProcessMonitor
    db: LevelDB

    constructor(lama: Lama, monitor: ProcessMonitor, db: LevelDB) {
        this.lama = lama;
        this.monitor = monitor
        this.db = db;
    }

    async processError(error: InterfaceError, key: string) {
        try {
            // Get the event that caused the error from key
            const eventData = await this.db._db.get(key);

            if (eventData) {
                if (error.type === "item_not_exist_error") {
                    await handleItemNotExistError(error, eventData, this.monitor, key);
                } else if (error.type === "pg_error") {
                    
                } else if (error.type === "schema_error") {
    
                } else if (error.type === "unkown_error") {
                    
                }
            } else {
                throw "Could Not Get Event that caused error"
            }
        } catch(err) {
            console.log(`\nOHH SHIT\n`);
            console.log(err);
        }
    }
}
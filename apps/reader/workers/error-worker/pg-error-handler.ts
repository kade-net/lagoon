import { LevelDB } from "../../db";
import { sleep } from "../replicate-worker/helpers";
import { ProcessMonitor } from "../replicate-worker/monitor";
import { PostgresErrors, parsePostgresErrorType } from "./classify-error";
import { InterfaceError } from "./errors";
import { retry } from "./helpers";
import { checkIfItemExistsAndRetryIfExists } from "./item-exist-error-handler";

async function retryXTimes(x: number, eventData: string, monitor: ProcessMonitor, sequence_number: string) {
    let tries = 0;
    let success = false;

    while (success === false && tries < x) {
        await sleep(60_000);
        success = await retry(eventData, monitor, sequence_number);
        tries += 1;
    } 
}

export async function handlePgError(error: InterfaceError, eventData: string, monitor: ProcessMonitor, sequence_number: string, db: LevelDB) {
    try {
        // get type of postgres error
        const errorType = parsePostgresErrorType(error.code);

        if (errorType === PostgresErrors.ConnectionError) {
            retryXTimes(3, eventData, monitor, sequence_number);
        } else if (errorType === PostgresErrors.InsufficientResources) {
            retryXTimes(3, eventData, monitor, sequence_number);
        } else if (errorType === PostgresErrors.ProgramLimitExceeded) {
            // This is an error in code
            monitor.failed.delete(sequence_number);
            console.log(`\n###################\n#CHECK THE CODE THERE IS A QUERY THAT IS TOO COMPLEX\n###############\n`);
            console.log(`Error Causing event is ${eventData}`);
        } else if(errorType === PostgresErrors.UniqueViolation) {
            // Delete event since it already occured
            monitor.failed.delete(sequence_number);
            db._db.delete(sequence_number);
        } else if(errorType === PostgresErrors.NotNullViolation) {
            // Some data was missing in the event delete it from monitor for now
            console.log(`\n###################\n#SOME DATA IS MISSING FROM THIS EVENT\n###############\n`);
            console.log(`Error Causing event is ${eventData}`);
        } else if(errorType === PostgresErrors.DataExceptionError) {
            // Some data was missing in the event delete it from monitor for now
            console.log(`\n###################\n#BAD DATA SENT IN EVENT\n###############\n`);
            console.log(`Error Causing event is ${eventData}`);
        } else if(errorType === PostgresErrors.InvalidCursorTransactionState) {
            console.log(`\n###################\n#CURSOR NOT IN VALID STATE\n###############\n`);
            console.log(`Error Causing event is ${eventData}`);
        } else if (errorType === PostgresErrors.IntegrityViolation) {
            // Whaterver it's trying to add has already been done
            monitor.failed.delete(sequence_number);
            db._db.delete(sequence_number);
        } else if (errorType === PostgresErrors.ForeignKeyViolation) {
            // Wait abit
            await sleep(60_000);

            const item = error.item;
            const id = error.id;
            // Check if item exists and retry if exists
            checkIfItemExistsAndRetryIfExists(item, id, eventData, monitor, sequence_number);
        }else {
            console.log(`\n###################\n#OTHER ERROR\n###############\n`);
            console.log(`Error Causing event is ${eventData}`);
        }
    } catch(err) {
        console.log("Could Not Handle Pg Error");
    }
}
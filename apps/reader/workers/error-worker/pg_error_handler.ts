import { sleep } from "../replicate-worker/helpers";
import { ProcessMonitor } from "../replicate-worker/monitor";
import { PostgresErrors, parsePostgresErrorType } from "./classify_error";
import { InterfaceError } from "./errors";
import { retry } from "./helpers";

async function retryXTimes(x: number, eventData: string, monitor: ProcessMonitor, sequence_number: string) {
    let tries = 0;
    let success = false;

    while (success === false && tries < x) {
        await sleep(60_000);
        success = retry(eventData, monitor, sequence_number);
        tries += 1;
    } 
}

export async function handlePgError(error: InterfaceError, eventData: string, monitor: ProcessMonitor, sequence_number: string) {
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
        } else if(errorType === PostgresErrors.NotNullViolation) {
            // Some data was missing in the event delete it from monitor for now
            console.log(`\n###################\n#SOME DATA IS MISSING FROM THIS EVENT\n###############\n`);
            console.log(`Error Causing event is ${eventData}`);
        } else if(errorType === PostgresErrors.DataExceptionError) {
            // Some data was missing in the event delete it from monitor for now
            console.log(`\n###################\n#BAD DATA SENT IN EVENT\n###############\n`);
            console.log(`Error Causing event is ${eventData}`);
        } else if(errorType === PostgresErrors.ForeignKeyViolation) {
            // Wait abit
            await sleep(60_000);
            // See if foreign key create
        } else if(errorType === PostgresErrors.InvalidCursorTransactionState) {
            console.log(`\n###################\n#CURSOR NOT IN VALID STATE\n###############\n`);
            console.log(`Error Causing event is ${eventData}`);
        } else {
            console.log(`\n###################\n#OTHER ERROR\n###############\n`);
            console.log(`Error Causing event is ${eventData}`);
        }


        if (errorType === PostgresErrors.ConnectionError) {
            // retry
            await sleep(60_000);
            await retry(eventData, this.monitor, key);
        } else if ([PostgresErrors.InsufficientResources, PostgresErrors.InvalidCursorTransactionState, PostgresErrors.OtherError].includes(errorType)) {
            // retry after a pause
            await sleep(180_000);
            await retry(eventData, this.monitor, key);
        } else if ([PostgresErrors.ForeignKeyViolation, PostgresErrors.IntegrityViolation].includes(errorType)) {
            // retry after a pause
            await sleep(180_000);
            await retry(eventData, this.monitor, key);
        } else if ([PostgresErrors.DataExceptionError, PostgresErrors.NotNullViolation].includes(errorType)) {
            // somehow get data again?
        } else if (errorType == PostgresErrors.UniqueViolation, PostgresErrors.ProgramLimitExceeded) {
            // ignore
        }
    } catch(err) {
        console.log("Could Not Handle Pg Error");
    }
}
import oracle, { account, account, delegate, eq, follow, profile } from "oracle"
import { sleep } from "../replicate-worker/helpers";
import { InterfaceError, KadeItems } from "./errors";
import { retry } from "./helpers";
import { ProcessMonitor } from "../replicate-worker/monitor";

export async function handleItemNotExistError(err: InterfaceError, eventData: string, monitor: ProcessMonitor, sequence_number: string) {
    try {
        // Wait for some time
        await sleep(60_000);

        // Check if item exists
        const item = err.code;
        const id = err.id;
        if (item == KadeItems.Account) {
            const eventAccount = await oracle.select().from(account).where(eq(account.id, id));

            if(eventAccount) {
                // Redo event
                await retry(eventData, monitor, sequence_number)
            } else {
                // Delete event from failed
                monitor.failed.delete(sequence_number);
            }
        }
    } catch(err) {
        console.log("Could Not Handle Item Not Exist Error")
    }
}
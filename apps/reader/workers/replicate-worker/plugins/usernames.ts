import schema from "../../../schema";
import { ProcessorPlugin } from "../helpers";
import oracle, { username } from "oracle"
import { ProcessMonitor } from "../monitor";


export class RegisterUsernamePlugin extends ProcessorPlugin {
    name(): string {
        return "RegisterUsernameEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string): Promise<void> {

        const parsed = schema.username_registration_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setFailed(sequence_number, JSON.stringify(parsed.error))
        }


        if (parsed.success) {
            const data = parsed.data

            try {
                await oracle.insert(username).values({
                    owner_address: data.owner_address,
                    token_address: data.token_address,
                    username: data.username,
                    timestamp: data.timestamp
                })
                monitor.success.put(sequence_number, "success")
                console.log("Data processed successfully")
            }
            catch (e) {
                monitor.setFailed(sequence_number, JSON.stringify({ error: e }))
                console.log(`Something went wrong while processing data: ${e}`)
            }
        }

    }
}

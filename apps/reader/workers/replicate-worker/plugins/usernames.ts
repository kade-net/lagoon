import schema from "../../../schema";
import { EVENT_NAMES, ProcessorPlugin } from "../helpers";
import oracle, { username } from "@kade-net/oracle"
import { ProcessMonitor } from "../monitor";


export class RegisterUsernamePlugin extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "RegisterUsernameEvent"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string): Promise<void> {

        const parsed = schema.username_registration_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setPosthogFailed(sequence_number, parsed.error);
        }


        if (parsed.success) {
            const data = parsed.data

            try {
                const previous = await oracle.query.username.findFirst({
                    where(fields, ops) {
                        return ops.eq(fields.owner_address, data.owner_address)
                    }
                })

                if (previous) {
                    console.log("Username already exists")
                    return
                }
                await oracle.insert(username).values({
                    owner_address: data.owner_address,
                    token_address: data.token_address,
                    username: data.username,
                    timestamp: data.timestamp
                })
                monitor.setPosthogSuccess(sequence_number);
                console.log("Data processed successfully")
            }
            catch (e) {
                monitor.setPosthogFailed(sequence_number, {error: e})
                console.log(`Something went wrong while processing data: ${e}`)
            }
        }

    }
}

export class UserNameReclaimedPlugin extends ProcessorPlugin {
    name(): EVENT_NAMES {
        return "UserNameReclaimed"
    }
    async process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string): Promise<void> {

        const parsed = schema.username_reclaimed_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
            monitor.setPosthogFailed(sequence_number, parsed.error);
        }

        if (parsed.success) {
            const data = parsed.data

            try {
                // await oracle.delete(username).
                // TODO: better reclaim logic
                console.log("Reclaiming username", data)
                monitor.setPosthogSuccess(sequence_number);
                console.log("Data processed successfully")
            }
            catch (e) {
                monitor.setPosthogFailed(sequence_number, { error: e })
                console.log(`Something went wrong while processing data: ${e}`)
            }
        }
    }

}
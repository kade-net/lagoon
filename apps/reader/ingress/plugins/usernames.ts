import { ServerWritableStream, events } from "tunnel";
import { EVENT_NAMES } from "../../workers/replicate-worker/helpers";
import { IngressPlugin } from "./definitions";
import schema from "../../schema";


export class RegisterUsernamePlugin extends IngressPlugin {
    name(): EVENT_NAMES {
        return 'RegisterUsernameEvent'
    }
    async process(call: ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string) {

        const parsed = schema.username_registration_event_schema.safeParse(event)

        if (!parsed.success) {
            console.log(parsed.error)
            return
        }

        if (parsed.success) {
            const data = parsed.data
            const event = new events.Event({
                username_registration_event: new events.UsernameRegistrationEvent({
                    owner_address: data.owner_address,
                    token_address: data.token_address,
                    username: data.username,
                    timestamp: data.timestamp.getTime()
                }),
                event_type: "RegisterUsernameEvent",
                sequence_number: parseInt(sequence_number),
            })

            call.write(event, (err: any) => {
                if (err) {
                    console.log(err)
                }
            })
        }
    }

}
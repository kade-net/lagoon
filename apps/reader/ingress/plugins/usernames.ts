import { ServerWritableStream, events, sendUnaryData } from "tunnel";
import { EVENT_NAMES } from "../../workers/replicate-worker/helpers";
import { IngressPlugin } from "./definitions";
import schema from "../../schema";


export class RegisterUsernamePlugin extends IngressPlugin {
    name(): EVENT_NAMES {
        return 'RegisterUsernameEvent'
    }

    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        const parsed = schema.username_registration_event_schema.safeParse(event)

        if (!parsed.success) {
            return null
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

            return event
        }

        return null
    }

    async process(call: ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string) {

        const event_data = this.extract(event, sequence_number)

        if (event_data) {

            call.write(event_data, (err: any) => {
                if (err) {
                    console.log(err)
                }
            })
        }
        else {
            console.log("Error parsing event")
        }

    }

    async processSingle(callback: sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string) {

        const event_data = this.extract(event, sequence_number)

        if (event_data) {
            callback(null, event_data)
        }
        else {
            console.log("Error parsing event")
        }
    }

}
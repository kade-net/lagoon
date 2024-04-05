import { ServerWritableStream, sendUnaryData } from "@grpc/grpc-js";
import { events } from "@kade-net/tunnel";
import { EVENT_NAMES } from "../../workers/replicate-worker/helpers";
import { IngressPlugin } from "./definitions";
import schema from "../../schema";



export class PublicationCreateEventPlugin extends IngressPlugin {
    name(): EVENT_NAMES {
        return 'PublicationCreate'
    }
    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        const parsed = schema.publication_create_event_schema.safeParse(event)

        if (!parsed.success) {
            return null
        }

        if (parsed.success) {
            const data = parsed.data
            const event = new events.Event({
                event_type: "PublicationCreate",
                sequence_number: parseInt(sequence_number),
                publication_create_event: new events.PublicationCreateEvent({
                    delegate: data.delegate,
                    kid: data.kid,
                    payload: data.payload,
                    publication_ref: data.publication_ref,
                    reference_kid: data.reference_kid,
                    timestamp: data.timestamp.getTime(),
                    type: data.type,
                    user_kid: data.user_kid
                })
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
            console.log('Error parsing event')
        }
    }

    async processSingle(callback: sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string) {
        const event_data = this.extract(event, sequence_number)

        if (event_data) {
            callback(null, event_data)
        }
        else {
            callback(new Error("Error parsing event"), null)
        }
    }
}


export class PublicationRemoveEventPlugin extends IngressPlugin {
    name(): EVENT_NAMES {
        return "PublicationRemove"
    }
    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        const parsed = schema.publication_remove_event_schema.safeParse(event)

        if (!parsed.success) {
            return null
        }

        if (parsed.success) {
            const data = parsed.data

            const event = new events.Event({
                event_type: "PublicationRemove",
                sequence_number: parseInt(sequence_number),
                publication_remove_event: new events.PublicationRemoveEvent({
                    delegate: data.delegate,
                    kid: data.kid,
                    timestamp: data.timestamp.getTime(),
                    user_kid: data.user_kid
                })
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
                    console.log("Error ::", err)
                }
            })
        }
        else {
            console.log("Error parsing event")
        }
    }
    async processSingle(callback: sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string): Promise<void> {
        const event_data = this.extract(event, sequence_number)

        if (event_data) {
            callback(null, event_data)
        } else {
            callback(new Error("Error parsing event"), null)
        }
    }

}

export class PublicationCreateWithRef extends IngressPlugin {
    name(): EVENT_NAMES {
        return "PublicationCreateWithRef"
    }
    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        const parsed = schema.publication_create_with_ref_event_schema.safeParse(event)

        if (!parsed.success) {
            return null
        }

        const data = parsed.data

        const event_data = new events.Event({
            publication_create_with_ref_event: new events.PublicationCreateWithRefEvent({
                ...data,
                timestamp: data.timestamp.getTime()
            }),
            event_type: "PublicationCreateWithRef",
            sequence_number: parseInt(sequence_number)
        })

        return event_data
    }
    async process(call: ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string) {
        const data = this.extract(event, sequence_number)

        if (data) {
            call.write(data, (err: any) => {
                if (err) {
                    console.log("Error parsing event")
                }
            })
        }
    }
    async processSingle(callback: sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string) {
        const data = this.extract(event, sequence_number)

        if (data) {
            callback(null, data)
        }
        else {
            callback(new Error("Error Parsing"), null)
        }
    }

}

export class PublicationRemoveWithRef extends IngressPlugin {
    name(): EVENT_NAMES {
        return "PublicationRemoveWithRef"
    }
    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        const parsed = schema.publication_remove_with_ref_event_schema.safeParse(event)

        if (!parsed.success) {
            return null
        }

        const data = parsed.data

        const event_data = new events.Event({
            publication_remove_with_ref_event: new events.PublicationRemoveWithRefEvent({
                ...data,
                timestamp: data.timestamp.getTime()
            }),
            event_type: "PublicationRemoveWithRef",
            sequence_number: parseInt(sequence_number)
        })

        return event_data
    }
    async process(call: ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string) {
        const data = this.extract(event, sequence_number)

        if (data) {
            call.write(data, (err: any) => {
                if (err) {
                    console.log("Error parsing event")
                }
            })
        }
        else {
            console.log("Error parsing event")
        }
    }
    async processSingle(callback: sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string): Promise<void> {
        const data = this.extract(event, sequence_number)

        if (data) {
            callback(null, data)
        }
        else {
            callback(new Error("Error Parsing"), null)
        }
    }

}

export class ReactionCreateEventPlugin extends IngressPlugin {
    name(): EVENT_NAMES {
        return "ReactionCreateEvent"
    }
    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        const parsed = schema.reaction_create_event_schema.safeParse(event)

        if (!parsed.success) {
            return null
        }

        const data = parsed.data

        const event_data = new events.Event({
            reaction_create_event: new events.ReactionCreateEvent({
                ...data,
                timestamp: data.timestamp.getTime()
            }),
            event_type: "ReactionCreateEvent",
            sequence_number: parseInt(sequence_number)
        })

        return event_data
    }
    async process(call: ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string): Promise<void> {
        const data = this.extract(event, sequence_number)

        if (data) {
            call.write(data, (err: any) => {
                if (err) {
                    console.log("Error parsing event")
                }
            })
        }
        else {
            console.log("Error parsing event")
        }
    }
    async processSingle(callback: sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string): Promise<void> {
        const data = this.extract(event, sequence_number)

        if (data) {
            callback(null, data)
        }
        else {
            callback(new Error("Error Parsing"), null)
        }
    }

}


export class ReactionCreateEventWithRefPlugin extends IngressPlugin {
    name(): EVENT_NAMES {
        return "ReactionCreateEventWithRef"
    }
    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        const parsed = schema.reaction_create_event_with_ref.safeParse(event)

        if (!parsed.success) {
            return null
        }

        const data = parsed.data

        const event_data = new events.Event({
            reaction_create_event_with_ref: new events.ReactionCreateEventWithRef({
                ...data,
                timestamp: data.timestamp.getTime()
            }),
            event_type: "ReactionCreateEventWithRef",
            sequence_number: parseInt(sequence_number)
        })

        return event_data
    }
    async process(call: ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string): Promise<void> {
        const data = this.extract(event, sequence_number)

        if (data) {
            call.write(data, (err: any) => {
                if (err) {
                    console.log("Error parsing event")
                }
            })
        }
        else {
            console.log("Error parsing event")
        }
    }
    async processSingle(callback: sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string): Promise<void> {
        const data = this.extract(event, sequence_number)

        if (data) {
            callback(null, data)
        }
        else {
            callback(new Error("Error Parsing"), null)
        }
    }
}


export class ReactionRemoveEventPlugin extends IngressPlugin {
    name(): EVENT_NAMES {
        return "ReactionRemoveEvent"
    }
    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        const parsed = schema.reaction_remove_event_schema.safeParse(event)

        if (!parsed.success) {
            return null
        }

        const data = parsed.data

        const event_data = new events.Event({
            reaction_remove_event: new events.ReactionRemoveEvent({
                ...data,
                timestamp: data.timestamp.getTime()
            }),
            event_type: "ReactionRemoveEvent",
            sequence_number: parseInt(sequence_number)
        })

        return event_data
    }
    async process(call: ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string): Promise<void> {
        const data = this.extract(event, sequence_number)

        if (data) {
            call.write(data, (err: any) => {
                if (err) {
                    console.log("Error parsing event")
                }
            })
        }
        else {
            console.log("Error parsing event")
        }
    }
    async processSingle(callback: sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string): Promise<void> {
        const data = this.extract(event, sequence_number)

        if (data) {
            callback(null, data)
        }
        else {
            callback(new Error("Error Parsing"), null)
        }
    }
}


export class ReactionRemoveEventWithRefPlugin extends IngressPlugin {
    name(): EVENT_NAMES {
        return "ReactionRemoveEventWithRef"
    }
    extract(event: Record<string, any>, sequence_number: string): events.Event | null {
        const parsed = schema.reaction_remove_event_with_ref.safeParse(event)

        if (!parsed.success) {
            return null
        }

        const data = parsed.data

        const event_data = new events.Event({
            reaction_remove_event_with_ref: new events.ReactionRemoveEventWithRef({
                ...data,
                timestamp: data.timestamp.getTime()
            }),
            event_type: "ReactionRemoveEventWithRef",
            sequence_number: parseInt(sequence_number)
        })

        return event_data
    }
    async process(call: ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string): Promise<void> {
        const data = this.extract(event, sequence_number)

        if (data) {
            call.write(data, (err: any) => {
                if (err) {
                    console.log("Error parsing event")
                }
            })
        }
        else {
            console.log("Error parsing event")
        }
    }
    async processSingle(callback: sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string): Promise<void> {
        const data = this.extract(event, sequence_number)

        if (data) {
            callback(null, data)
        }
        else {
            callback(new Error("Error Parsing"), null)
        }
    }
}
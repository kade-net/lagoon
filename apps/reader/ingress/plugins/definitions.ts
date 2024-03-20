import tunnel, { events } from 'tunnel'
import { EVENT_NAMES } from "../../workers/replicate-worker/helpers";


export abstract class IngressPlugin {

    constructor() { }

    abstract name(): EVENT_NAMES

    abstract process(call: tunnel.ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string): Promise<void>

}
import tunnel, { events } from '@kade-net/tunnel'
import { EVENT_NAMES } from "../../workers/replicate-worker/helpers";


export abstract class IngressPlugin {

    constructor() { }

    abstract name(): EVENT_NAMES

    abstract extract(event: Record<string, any>, sequence_number: string): events.Event | null

    abstract process(call: tunnel.ServerWritableStream<events.EventsRequest, events.Event>, event: Record<string, any>, sequence_number: string): Promise<void>

    abstract processSingle(callback: tunnel.sendUnaryData<events.Event>, event: Record<string, any>, sequence_number: string): Promise<void>

}
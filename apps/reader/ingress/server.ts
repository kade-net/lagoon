import tunnel, { events, UnimplementedTunnelServiceService } from 'tunnel'
import dataProcessor from './setup';
import { LevelDB } from '../db';

const db = await LevelDB.init()

class TunnelServer implements UnimplementedTunnelServiceService {
    [method: string]: tunnel.UntypedHandleCall;
    async GetTunnelEvents(call: tunnel.ServerWritableStream<events.EventsRequest, events.Event>) {
        const request = call.request.toObject();
        const starting_sequence_number = request.sequence_number
        try {
            await dataProcessor.process(call, starting_sequence_number)
        }
        catch (e) {
            console.log("Error::", e)
        }
        call.end()
    }
    async GetTunnelEvent(call: tunnel.ServerUnaryCall<events.EventRequest, events.Event>, callback: tunnel.sendUnaryData<events.Event>) {
        try {

            await dataProcessor.singleEvent(call, callback)
        }
        catch (e) {
            console.log("Error::", e)
            callback(Error("Something unexpected happened"), null)
        }
    }
}

const tunnelServer = new TunnelServer()

export default tunnelServer
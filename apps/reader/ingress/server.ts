import tunnel, { events, UnimplementedTunnelServiceService } from 'tunnel'
import dataProcessor from './setup';

class TunnelServer implements UnimplementedTunnelServiceService {
    [method: string]: tunnel.UntypedHandleCall;
    async GetTunnelEvents(call: tunnel.ServerWritableStream<events.EventsRequest, events.Event>) {
        const request = call.request.toObject();
        const starting_sequence_number = request.sequence_number
        await dataProcessor.process(call, starting_sequence_number)
        call.end()
    }
}

const tunnelServer = new TunnelServer()

export default tunnelServer
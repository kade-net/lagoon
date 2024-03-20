import { TunnelServiceClient, credentials, events } from 'tunnel'


const client = new TunnelServiceClient('localhost:8080', credentials.createInsecure())

function main() {
    const call = client.GetTunnelEvents(new events.EventsRequest({
        event_type: "ddd",
        sequence_number: 0
    }))

    call.on('data', (data) => {
        console.log("Data::", data.toObject())
    })

    call.on('end', () => {
        console.log("Call ended")
    })

    call.on('error', (error) => {
        console.log("Error::", error)
    })
}

main()

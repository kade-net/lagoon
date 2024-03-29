import 'dotenv/config'
import tunnel, { UnimplementedTunnelServiceService } from '@kade-net/tunnel'
import tunnelServer from './server'

const server = new tunnel.Server()
server.addService(UnimplementedTunnelServiceService.definition, tunnelServer)

const PORT = process.env.GRPC_PORT! || process.env.PORT! || '8089'

console.log(`RAILWAY PORT :: `, process.env.PORT!)

function main() {
    server.bindAsync(`0.0.0.0:${PORT}`, tunnel.ServerCredentials.createInsecure(), (error, port) => {
        if (error) {
            console.log("Error::", error)
            return
        }
        server.start()
        console.log("Server started on port::", port)
    })
}

main()
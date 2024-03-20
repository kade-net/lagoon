import 'dotenv/config'
import tunnel, { UnimplementedTunnelServiceService } from 'tunnel'
import tunnelServer from './server'

const server = new tunnel.Server()
server.addService(UnimplementedTunnelServiceService.definition, tunnelServer)

const PORT = process.env.GRPC_PORT! || '8089'

function main() {
    server.bindAsync(`localhost:${PORT}`, tunnel.ServerCredentials.createInsecure(), (error, port) => {
        if (error) {
            console.log("Error::", error)
            return
        }
        server.start()
        console.log("Server started on port::", port)
    })
}

main()
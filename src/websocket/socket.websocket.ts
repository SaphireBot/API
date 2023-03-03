import { IncomingMessage } from "http"
import { env } from "process"
import { WebSocket } from "ws"

export default async (socket: WebSocket, request: IncomingMessage) => {

    const authorization = request.headers.authorization || null
    const shardId = Number(request.headers.shardid)

    if (authorization !== env.WEBSOCKET_CONNECTION_AUTHORIZATION) {
        socket.send("Connection failed because authorization key is incorrect.")
        return socket.close(4004, "Authentication Failed.")
    }

    if (isNaN(shardId)) {
        socket.send("Shard ID is not defined or it isn't a number")
        return socket.close(1002, "Shard ID incorrect.")
    }

    socket.on("error", console.error);

    return socket.send(`Shard ${shardId} conectada.`)
}
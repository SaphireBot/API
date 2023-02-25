import { env } from "process";
import { wss } from "../server";

wss.once("listening", () => console.log("Websocket System Started"))

wss.on("connection", (socket, request) => {

    const authorization = request.headers.authorization || null
    const shardId = Number(request.headers.shardid)

    if (authorization !== env.WEBSOCKET_CONNECTION_AUTHORIZATION) {
        socket.send("[WEBSOCKET] Connection failed because authorization key is incorrect.")
        return socket.close(4004, "[WEBSOCKET] Authentication Failed.")
    }

    if (isNaN(shardId)) {
        socket.send("[WEBSOCKET] Shard ID is not defined or it isn't a number")
        return socket.close(1002, "[WEBSOCKET] Shard ID incorrect.")
    }

    socket.on("error", console.error);

    return socket.send(`[WEBSOCKET] Shard ${shardId} conectada.`)
});

wss.on("error", error => console.log(error))
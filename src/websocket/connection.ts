import { CallbackType, ShardsStatus, WebsocketMessageRecieveData } from "../@types";
import { Collection } from "discord.js";
import { Socket } from "socket.io";
import { env } from "process";
import postmessage from "./functions/postmessage";
export const interactions = {
    commands: new Collection<string, number>(),
    count: 0,
    message: 0
}
export const shards = new Collection<number, ShardsStatus>()
const shardsAndSockets = new Collection<number, Socket>()
setInterval(() => checkIfTheShardIsAlive(), 1000 * 15)

export default (socket: Socket) => {

    if (socket.handshake.auth?.token as string !== env.WEBSOCKET_SAPHIRE_API_LOGIN_PASSWORD) {
        socket.send({ type: "console", message: "Where is the token bro?" })
        return socket.disconnect(true)
    }

    if (isNaN(socket.handshake.auth?.shardId)) {
        socket.send({ type: "console", message: "Where is the shardId bro?" })
        return socket.disconnect(true)
    }

    const shardId = socket.handshake.auth.shardId as number
    shardsAndSockets.set(shardId, socket)

    socket.on("disconnect", () => setOfflineShard(shardId))

    socket.send({
        type: "console",
        message: `[WebSocket Message] Welcome Shard ${shardId} (${socket.id})`
    })

    socket.on("message", (data: WebsocketMessageRecieveData) => {

        if (!data || !data.type) return

        switch (data.type) {
            case "addInteraction": interactions.count++; break;
            case "addMessage": interactions.message++; break;
            case "registerCommand": registerNewCommand(data?.commandName); break;
            default: console.log(data); break;
        }
        return
    })

    socket.on("getSaphireData", (data: any, callback: CallbackType) => {
        if (!data) return
        return callback({
            commands: Object.fromEntries(interactions.commands.entries()),
            count: interactions.count,
            messages: interactions.message
        })
    })

    socket.on("getShardsData", (data: any, callback: CallbackType) => {
        if (!data) return
        return callback(Object.fromEntries(shards.entries()))
    })

    socket.on("ping", (_, callback) => callback("pong"))
    socket.on("postMessage", data => postmessage(data, socket))
    socket.on("shardStatus", (data: ShardsStatus) => {
        if (!data || isNaN(Number(data.shardId))) return
        shards.set(data.shardId, data)
        return
    })

}

function registerNewCommand(commandName: string | undefined): void {
    if (!commandName) return
    interactions.commands.set(
        commandName,
        (interactions.commands.get(commandName) || 0) + 1
    )
    return
}

function checkIfTheShardIsAlive() {
    if (!shardsAndSockets.size) return

    shardsAndSockets
        .forEach((socket: Socket, shardId: number) => {
            socket
                .timeout(5000)
                .emitWithAck("isAlive", "ping")
                .then((data: ShardsStatus) => {
                    if (!data || isNaN(Number(data.shardId))) return
                    shards.set(data.shardId, data)
                    return
                })
                .catch(() => setOfflineShard(shardId))
            return
        })
    return
}

function setOfflineShard(shardId: number) {
    shardsAndSockets.delete(shardId)
    const data = shards.get(shardId)
    if (!data) return
    data.ready = false
    data.users = 0
    data.guilds = 0
    data.ms = 0
    delete data.socketId
    return shards.set(shardId, data)
}
import { Socket } from "socket.io";
import { Collection } from "discord.js";
import { env } from "process";
import { CallbackType, ShardsStatus, WebsocketMessageRecieveData } from "../@types";
import postmessage from "./functions/postmessage";
export const interactions = {
    commands: new Collection<string, number>(),
    count: 0,
    message: 0
}
export const shards = new Collection<string, ShardsStatus>()

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
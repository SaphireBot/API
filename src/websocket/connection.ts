import { Socket } from "socket.io";
import { Collection } from "discord.js";
import { env } from "process";
import { WebsocketMessageRecieveData } from "../@types";
export const interactions = {
    commands: new Collection<string, number>(),
    count: 0,
    message: 0
}
const shards = new Collection()

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
    shards.set(shardId, socket.id)

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
            case "getCommands": socket.emit("responseCommand", interactions.commands.map((count, name) => ({ [name]: count }))); break;
            case "getSaphireData": socket.emit(data.listener || "fumou?", {
                commands: Object.fromEntries(interactions.commands.entries()),
                count: interactions.count,
                messages: interactions.message
            }); break;
            default: console.log(data); break;
        }

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
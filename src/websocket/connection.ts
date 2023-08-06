import { CallbackType, GetAndDeleteCacheType, GetMultiplecacheDataType, MessageSaphireRequest, ShardsStatus, WebsocketMessageRecieveData, commandApi } from "../@types";
import { Collection } from "discord.js";
import { Socket } from "socket.io";
import { staffs } from "../site";
import { env } from "process";
import postmessage from "./functions/postmessage";
import getCache from "./cache/get.cache";
import getMultipleCache from "./cache/multiple.cache";
import refreshCache from "./cache/update.cache";
import deleteCache from "./cache/delete.cache";
import twitchCache from "./cache/twitch.cache";
import postAfk from "./functions/postafk";
import postmessagewithreply from "./functions/postmessagewithreply";
export const interactions = {
    commands: new Collection<string, number>(),
    count: 0,
    message: 0
}
export const allGuilds = new Collection<string, string>()
export const apiCommandsData = new Collection<string, commandApi>()
export const shards = new Collection<number, ShardsStatus>()
export const shardsAndSockets = new Collection<number, Socket>()
setInterval(() => shardsAndSockets.random()?.send({ type: "refreshRanking" }), 1000 * 60 * 15)
let siteSocket: Socket;

export default (socket: Socket) => {

    if (socket.handshake.auth?.token as string !== env.WEBSOCKET_SAPHIRE_API_LOGIN_PASSWORD) {
        socket.send({ type: "console", message: "Where is the token bro?" })
        return socket.disconnect(true)
    }

    if (socket.handshake.auth?.shardId == "site") {
        // messageAdded
        siteSocket = socket
        socket.emit("message", "Websocket Connected")
        return
    }

    if (isNaN(socket.handshake.auth?.shardId)) {
        socket.send({ type: "console", message: "Where is the shardId bro?" })
        return socket.disconnect(true)
    }

    const shardId = socket.handshake.auth.shardId as number
    shardsAndSockets.set(shardId, socket)

    socket.on("connect", () => shardsAndSockets.set(shardId, socket))
    socket.on("disconnect", () => {
        shards.delete(shardId)
        shardsAndSockets.delete(shardId)
    })

    socket.send({
        type: "console",
        message: `[WebSocket Message] Welcome Shard ${shardId} (${socket.id})`
    })

    socket.on("message", (data: WebsocketMessageRecieveData) => {

        if (!data || !data.type) return

        switch (data.type) {
            case "addInteraction":
                interactions.count++
                if (siteSocket) siteSocket.emit("addInteraction", interactions.count)
                break;
            case "addMessage": interactions.message++; break;
            case "registerCommand": registerNewCommand(data?.commandName); break;
            case "apiCommandsData": registerCommandsApi({ commandApi: data.commandsApi as commandApi[] }); break;
            case "guildCreate": newGuild(data.guildId, data.guildName); break;
            case "guildDelete": allGuilds.delete(data.guildId); break;
            case "updateCache": refreshCache(data?.id, data?.to, data?.data); break;
            case "deleteCache": deleteCache(data.id, data.to); break;
            case "postMessage": postmessage(data.messageData, socket); break;
            case "removeChannelFromTwitchManager": twitchCache(data.id); break;
            case "AfkGlobalSystem": postAfk({ message: data.message, method: data.method, userId: data.userId }); break;
            case "siteStaffData": data.staffData?.id ? staffs.set(data.staffData.id, data.staffData) : null; break;
            case "shardStatus": setShardStatus(data.shardData, socket); break;
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

    socket.on("postMessageWithReply", (data: MessageSaphireRequest, callback: CallbackType) => postmessagewithreply(data, callback))
    socket.on("getAllGuilds", (_: any, callback: CallbackType) => callback(allGuilds.map((name, id) => ({ name, id }))))

    // Cache
    socket.on("getCache", (data: GetAndDeleteCacheType, callback: CallbackType) => getCache(data?.id, data?.type, callback))
    socket.on("getMultipleCache", (data: GetMultiplecacheDataType, callback: CallbackType) => getMultipleCache(data?.ids, data?.type, callback))

    // Shards
    socket.on("getShardsData", (_: any, callback: CallbackType) => callback(Object.fromEntries(shards.entries())))

}

function setShardStatus(data: ShardsStatus, socket: Socket) {
    if (!data || isNaN(Number(data.shardId))) return
    for (const guild of data.guilds) allGuilds.set(guild.id, guild.name)
    data.socketId = socket.id
    shardsAndSockets.set(data.shardId, socket)
    shards.set(data.shardId, data)
    return
}

function registerNewCommand(commandName: string | undefined): void {
    if (!commandName) return
    interactions.commands.set(
        commandName,
        (interactions.commands.get(commandName) || 0) + 1
    )
    return
}

function registerCommandsApi({ commandApi }: { commandApi: commandApi[] }) {

    if (commandApi?.length)
        for (const cmd of commandApi) apiCommandsData.set(cmd?.name, cmd)

    return
}

function newGuild(guildId: string, guildName: string) {
    if (!guildId || !guildName) return
    allGuilds.set(guildId, guildName)
}
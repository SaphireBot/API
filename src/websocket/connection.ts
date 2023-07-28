import { AfkGlobalData, CallbackType, GetAndDeleteCacheType, GetMultiplecacheDataType, MessageSaphireRequest, MessageToSendThroughWebsocket, RefreshCache, ShardsStatus, SiteStaffs, WebsocketMessageRecieveData, commandApi } from "../@types";
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
export const apiCommandsData = new Collection<string, commandApi>()
export const shards = new Collection<number, ShardsStatus>()
export const shardsAndSockets = new Collection<number, Socket>()
export const baseData = {
    guilds: <Record<number, number>>{},
    commands: () => apiCommandsData.size
}
let siteSocket: Socket;
setInterval(() => checkIfTheShardIsAlive(), 1000 * 15)

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
    socket.data.shardId = shardId
    shardsAndSockets.set(shardId, socket)

    socket.on("disconnect", () => setOfflineShard(shardId))

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
            case "apiCommandsData": registerCommandsApi({ commandApi: data.commandsApi as commandApi[], guilds: data.guilds, shardId: data.shardId }); break;
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

    socket.on("ping", (_: any, callback: CallbackType) => callback("pong"))
    socket.on("postMessage", (data: MessageToSendThroughWebsocket) => postmessage(data, socket))
    socket.on("postMessageWithReply", (data: MessageSaphireRequest, callback: CallbackType) => postmessagewithreply(data, callback))
    socket.on("getAllGuilds", (_: any, callback: CallbackType) => callback(shards.map(data => data.guilds || []).flat()))

    // Cache
    socket.on("getCache", (data: GetAndDeleteCacheType, callback: CallbackType) => getCache(data?.id, data?.type, callback))
    socket.on("getMultipleCache", (data: GetMultiplecacheDataType, callback: CallbackType) => getMultipleCache(data?.ids, data?.type, callback))
    socket.on("updateCache", (data: RefreshCache) => refreshCache(data?.id, data?.type, data?.data))
    socket.on("deleteCache", (data: GetAndDeleteCacheType) => deleteCache(data?.id, data?.type))
    socket.on("removeChannelFromTwitchManager", (channelId: string | undefined) => twitchCache(channelId))
    socket.on("AfkGlobalSystem", (data: AfkGlobalData) => postAfk(data, socket))

    // Site
    socket.on("siteStaffData", (data: SiteStaffs) => {
        if (data?.id) staffs.set(data?.id, data)
        return
    })

    // Shards
    socket.on("getShardsData", (_: any, callback: CallbackType) => callback(Object.fromEntries(shards.entries())))
    socket.on("shardStatus", (data: ShardsStatus) => {
        if (!data || isNaN(Number(data.shardId))) return
        data.socketId = socket.id
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

async function checkIfTheShardIsAlive() {
    if (!shardsAndSockets.size) return

    shardsAndSockets
        .forEach((socket: Socket, shardId: number) => {
            socket
                .timeout(5000)
                .emitWithAck("isAlive", "ping")
                .then((data: ShardsStatus) => {
                    if (!data || isNaN(Number(data.shardId))) return
                    data.socketId = socket.id
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
    data.usersCount = 0
    data.guildsCount = 0
    data.guilds = []
    data.ms = 0
    delete data.socketId
    return shards.set(shardId, data)
}

function registerCommandsApi({ commandApi, guilds, shardId }: { commandApi: commandApi[], guilds: number | undefined, shardId: number | undefined }) {

    if (commandApi?.length)
        for (const cmd of commandApi) apiCommandsData.set(cmd?.name, cmd)

    if (
        guilds !== undefined
        && shardId !== undefined
        && guilds >= 0
        && shardId >= 0
    )
        baseData.guilds[shardId] = guilds

    return
}
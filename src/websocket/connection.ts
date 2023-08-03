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
export const allGuilds = new Collection<string, string>()
export const apiCommandsData = new Collection<string, commandApi>()
export const shards = new Collection<number, ShardsStatus>()
export const shardsAndSockets = new Collection<number, Socket>()
export const baseData = {
    guilds: <Record<number, number>>{},
    commands: () => apiCommandsData.size,
    guildsId: <string[]>[]
}
let siteSocket: Socket;
// setInterval(() => checkIfTheShardIsAlive(), 1000 * 15)

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

    socket.on("disconnect", () => shardsAndSockets.delete(shardId))

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
            case "apiCommandsData": registerCommandsApi({ commandApi: data.commandsApi as commandApi[], guilds: data.guilds, shardId: data.shardId, guildsId: data.guildsId }); break;
            case "guildCreate": newGuild(data.guildId, data.guildName, shardId); break;
            case "guildDelete": allGuilds.delete(data.guildId); break;
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
    socket.on("getAllGuilds", (_: any, callback: CallbackType) => callback(allGuilds.map((name, id) => ({ name, id }))))

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
        for (const guild of data.guilds) allGuilds.set(guild.id, guild.name)
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

function registerCommandsApi({ commandApi, guilds, shardId, guildsId }: { commandApi: commandApi[], guilds: number | undefined, shardId: number | undefined, guildsId: string[] | undefined }) {

    if (commandApi?.length)
        for (const cmd of commandApi) apiCommandsData.set(cmd?.name, cmd)

    if (guildsId?.length)
        baseData.guildsId = Array.from(new Set([...baseData.guildsId, ...guildsId]))

    if (
        guilds !== undefined
        && shardId !== undefined
        && guilds >= 0
        && shardId >= 0
    )
        baseData.guilds[shardId] = guilds

    return
}

function newGuild(guildId: string, guildName: string, shardId: number) {
    if (!guildId || !guildName || !shardId) return
    allGuilds.set(guildId, guildName)
    if (!baseData.guildsId.includes(guildId)) baseData.guildsId.push(guildId)
    if (baseData.guilds[shardId]) baseData.guilds[shardId]++
}
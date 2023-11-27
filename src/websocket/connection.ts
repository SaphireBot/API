import { APIGuildObject, CallbackType, ChatMessage, GetAndDeleteCacheType, GetMultiplecacheDataType, MessageSaphireRequest, ShardsStatus, WebsocketMessageRecieveData, commandApi, staffData } from "../@types";
import { APIApplicationCommand, Collection } from "discord.js";
import { Socket } from "socket.io";
import { staffs } from "../site";
import { env } from "process";
import postmessage from "./functions/postmessage";
import getCache, { get, set } from "./cache/get.cache";
import getMultipleCache from "./cache/multiple.cache";
import deleteCache from "./cache/delete.cache";
import postAfk from "./functions/postafk";
import postmessagewithreply from "./functions/postmessagewithreply";
import getSocial from "../site/social.get";
import getDescription from "../site/description.get";
import Database from "../database";
import Blacklist from "../blacklist/manager"
import { ws } from "../server";
import { UserSchema } from "../database/model/user";
export const interactions = {
    commands: new Collection<string, number>(),
    count: 0,
    message: 0
};
export const allGuilds = new Collection<string, APIGuildObject>();
export const apiCommandsData = new Collection<string, commandApi>();
export const shards = new Collection<number, ShardsStatus>();
export const shardsAndSockets = new Collection<number, Socket>();
export let siteSocket: Socket | undefined;
export const applicationCommands = new Collection<string, APIApplicationCommand>();

setInterval(() => shardsAndSockets.random()?.send({ type: "refreshRanking" }), 1000 * 60 * 15);
refreshSiteData();
setInterval(() => refreshSiteData(), 1000 * 15);
const chatMessages = new Collection<number, ChatMessage>();

setTimeout(() => shardsAndSockets.random()?.send({ type: "sendStaffData" }), 1000 * 60 * 30);

export default (socket: Socket) => {

    if (socket.handshake.auth?.token as string !== env.WEBSOCKET_SAPHIRE_API_LOGIN_PASSWORD) {
        socket.send({ type: "console", message: "Where is the token bro?" })
        return socket.disconnect(true);
    }

    if (socket.handshake.auth?.shardId == "site") {
        // messageAdded
        siteSocket = socket
        socket.on("getChatMessages", (_, callback: CallbackType) => callback(chatMessages.sort((a, b) => a.date - b.date).toJSON()));
        socket.on("getAllBlacklist", (_, callback: CallbackType) => Blacklist.all(callback));
        socket.on("baseData", refreshSiteData);

        socket.on("dailyCheck", async (userId, callback: CallbackType) => {

            if (!userId || typeof userId !== "string") return callback(null)

            const userData = await Database.User.findOne({ id: userId })
            if (!userData) return callback(null)

            return callback({
                timeout: userData?.Timeouts?.Daily || 0,
                count: userData?.DailyCount || 0
            })

        })

        socket.on("transactions", async (userId: string, callback: CallbackType) => {

            let data = await get(userId) as UserSchema | any;

            if (!data) {
                data = await Database.User.findOne({ id: userId });
                if (data?.id) set(data.id, data?.toObject());
            }

            return callback({
                Transactions: data?.Transactions || [],
                Balance: data?.Balance || 0
            })

        })
        socket.emit("message", "Websocket Connected");
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
                if (siteSocket) siteSocket.send("addInteraction")
                break;
            case "addMessage": interactions.message++; break;
            case "registerCommand": registerNewCommand(data?.commandName); break;
            case "apiCommandsData": registerCommandsApi({ commandApi: data.commandsApi as commandApi[] }); break;
            case "guildCreate": newGuild(data.guildData); break;
            case "guildDelete": allGuilds.delete(data.id); break;
            case "updateCache": ""; break;
            // case "updateCache": refreshCache(data?.to, data?.data); break;
            case "deleteCache": deleteCache(data.id, data.to); break;
            case "postMessage": postmessage(data.messageData, socket); break;
            case "AfkGlobalSystem": postAfk({ message: data.message, method: data.method, userId: data.userId }); break;
            case "siteStaffData": siteStaffData(data.staffData); break;
            case "shardStatus": setShardStatus(data.shardData, socket); break;
            case "transactions": siteSocket?.emit("transactions", data.transactionsData); break;
            case "notification": siteSocket?.emit("notification", data.notifyData); break;
            case "chatMessage": chatMessages.set(data?.chatMessage.date, data.chatMessage); break;
            case "ApplicationCommandData": apllicationCommands(data.applicationCommandData); break;

            // Blacklist Section
            case "refreshIDBlacklist": Blacklist.refresh(data.id); break;
            case "clearIDBlacklist":
                Blacklist.clear(data.id);
                ws.send({ type: "blacklistRemove", id: data.id });
                break;

            default: console.log(data); break;
        }
        return
    })

    socket.on("ping", (_, callback: CallbackType) => callback("pong"))
    socket.on("getSaphireData", (data: any, callback: CallbackType) => {
        if (!data) return
        return callback({
            commands: Object.fromEntries(interactions.commands.entries()),
            count: interactions.count,
            messages: interactions.message
        })
    })

    socket.on("postMessageWithReply", (data: MessageSaphireRequest, callback: CallbackType) => postmessagewithreply(data, callback))
    socket.on("getAllGuilds", (_: any, callback: CallbackType) => callback(allGuilds.map((data, id) => ({ name: data.name, id }))))

    // Cache
    socket.on("getCache", (data: GetAndDeleteCacheType, callback: CallbackType) => getCache(data?.id, data?.type, callback))
    socket.on("getMultipleCache", (data: GetMultiplecacheDataType, callback: CallbackType) => getMultipleCache(data?.ids, data?.type, callback))
    socket.on("getApplicationCommands", (_, callback: CallbackType) => callback(applicationCommands.toJSON()))

    // Shards
    socket.on("getShardsData", (_: any, callback: CallbackType) => callback(Object.fromEntries(shards.entries())))

    // Blacklist
    socket.on("getAllBlacklist", (_, callback: CallbackType) => Blacklist.all(callback))
    return
}

function setShardStatus(data: ShardsStatus, socket: Socket) {
    if (!data || isNaN(Number(data.shardId))) return
    for (const guild of data.guilds) allGuilds.set(guild.id, guild)
    data.socketId = socket.id
    shardsAndSockets.set(data.shardId, socket)
    shards.set(data.shardId, data)
    return
}

function registerNewCommand(commandName: string | undefined): void {
    if (!commandName) return
    interactions.commands.set(commandName, (interactions.commands.get(commandName) || 0) + 1)
    return
}

function registerCommandsApi({ commandApi }: { commandApi: commandApi[] }) {
    if (commandApi?.length)
        for (const cmd of commandApi) apiCommandsData.set(cmd?.name, cmd)

    if (siteSocket?.connected)
        siteSocket.emit("refresh", { commands: apiCommandsData.toJSON() })

    return
}

function newGuild(guild: APIGuildObject) {
    if (!guild) return
    return allGuilds.set(guild.id, guild)
}

function siteStaffData(staffData: staffData[]) {
    if (!Array.isArray(staffData) || !staffData?.length) return
    for (const staff of staffData) staffs.set(staff.id, staff)
    return
}

function apllicationCommands(commands: APIApplicationCommand[]) {
    for (const cmd of commands) applicationCommands.set(cmd.name, cmd)
    return
}

function refreshSiteData() {
    if (!apiCommandsData.size)
        shardsAndSockets
            .random()
            ?.timeout(1000)
            .emitWithAck("commands", "get")
            .then((res: commandApi[]) => {
                if (!res?.length) return
                for (const cmd of res)
                    apiCommandsData.set(cmd.name, cmd)
                emitSite()
            })
            .catch(() => emitSite())
    else emitSite()

    return

    function emitSite() {

        const developers = [] as staffData[]
        const admins = [] as staffData[]
        const boards = [] as staffData[]
        const staff = [] as staffData[]

        staffs
            .forEach(data => {

                if (!data.avatarUrl) data.avatarUrl = "https://media.discordapp.net/attachments/893361065084198954/1132515877124841522/No-photo-m.png"

                if (data.id) {
                    data.social = getSocial(data.id)
                    data.description = getDescription(data.id)
                }

                if (data.tags.includes("developer")) return developers.push(data)
                if (data.tags.includes("adminstrator")) return admins.push(data)
                if (data.tags.includes("board of directors")) return boards.push(data)
                if (data.tags.includes("staff")) return staff.push(data)
                staffs.set(data.id, data)
            })

        if (siteSocket)
            siteSocket.emit("refresh", {
                guilds: allGuilds.toJSON(),
                commands: apiCommandsData.toJSON(),
                interactions: interactions.count,
                staffs: staffs.toJSON()
            })
        return
    }

}

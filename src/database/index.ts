import cache from "./model/cache";
import client from "./model/client";
import guild from "./model/guilds";
import reminder from "./model/reminder";
import user from "./model/user";
import blacklist from "./model/blacklist"
import { ranking, set } from "../websocket/cache/get.cache";
import { Types } from "mongoose";
import { createClient } from "redis";
import { env } from "process";
export const redis = createClient({
    password: env.REDIS_USER_PASSWORD,
    socket: {
        host: env.REDIS_SOCKET_HOST_URL,
        port: Number(env.REDIS_SOCKET_HOST_PORT)
    }
});

redis.connect();
redis.on("error", err => console.log("REDIS ERROR", err));

export default new class Database {
    Client: typeof client
    Cache: typeof cache
    Guild: typeof guild
    User: typeof user
    Reminder: typeof reminder
    Blacklist: typeof blacklist

    constructor() {
        this.Client = client
        this.Cache = cache
        this.Guild = guild
        this.User = user
        this.Reminder = reminder
        this.Blacklist = blacklist
    }

    watch() {

        const guildIds: Types.ObjectId[] = []
        const userIds: Types.ObjectId[] = []

        this.Guild.watch()
            .on("change", async change => {

                if (["update", "insert"].includes(change.operationType)) {

                    if (guildIds.length)
                        return guildIds.push(change.documentKey._id)

                    guildIds.push(change.documentKey._id)
                    setTimeout(async () => {
                        if (!guildIds.length) return
                        const ids = Array.from(new Set(guildIds.splice(0)))
                        const documents = await guild.find({ _id: { $in: ids } })

                        for (const doc of documents)
                            if (doc?.id) set(doc.id, doc.toObject())
                    }, 1000)
                    return
                }

            })

        this.User.watch()
            .on("change", async change => {

                if (["update", "insert"].includes(change.operationType)) {

                    if (userIds.length)
                        return userIds.push(change.documentKey._id)

                    userIds.push(change.documentKey._id)
                    setTimeout(async () => {
                        if (!userIds.length) return
                        const ids = Array.from(new Set(userIds.splice(0)))
                        const documents = await user.find({ _id: { $in: ids } })

                        await Promise.all(documents.map(d => redis.json.set(d.id, "$", d.toObject())));
                        await Promise.all(documents.map(d => redis.expire(d.id, 5 * 60)));

                        for await (const doc of documents) {
                            if (doc?.id) set(doc.id, doc.toObject());

                            const data = ranking.get(doc?.id)
                            if (data) {
                                data.balance = doc?.Balance || 0
                                ranking.set(doc.id, data);
                            }
                        }

                    }, 1000)
                    return
                }

            })

        this.Client.watch()
            .on("change", async change => {

                if (["update", "insert"].includes(change.operationType)) {
                    const data = await this.Client.findById(change.documentKey._id);
                    if (!data?.id) return;
                    if (data?.id) set(data.id, data.toObject());
                }

            })
    }
}
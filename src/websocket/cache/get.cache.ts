import { Collection } from "discord.js";
import { CallbackType } from "../../@types";
import database, { redis } from "../../database";
export const ranking = new Collection<string, { id: string, balance: number, position: number }>()

export default async (id: string | undefined, type: "user" | "guild" | "client" | "ranking" | undefined, callback: CallbackType): Promise<void> => {

    if (!id || !type) return callback(null)

    if (type === "ranking") return callback(ranking.get(id));

    const cache = await get(id);
    if (cache) return callback(cache);

    let data: any = undefined;

    if (type === "guild") data = await database.Guild.findOne({ id }).then(doc => doc?.toObject());
    if (type === "user") data = await database.User.findOne({ id }).then(doc => doc?.toObject());
    if (type === "client") data = await database.Client.findOne({ id }).then(doc => doc?.toObject());

    if (!data) return callback({ id });
    set(id, data);
    return callback(data);

}

export async function set(key: string | undefined, value: any) {
    if (!key || !value) return;

    if ("toObject" in value) {
        await redis.set(key, JSON.stringify(value.toObject()), { "EX": 5 * 60 })
    } else await redis.set(key, JSON.stringify(value), { "EX": 5 * 60 })

    return;
}

export async function get(key: string): Promise<any> {
    const data = await redis.get(key) || "{}";
    if (typeof data !== "string") return {};
    return JSON.parse(data) as any
}

export async function mGet(keys: string[]): Promise<any> {
    return (await redis.mGet(keys) || ["{}"])
        .map(d => JSON.parse(d || "{}")) as any[]
}
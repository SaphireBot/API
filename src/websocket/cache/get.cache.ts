import { Collection } from "discord.js";
import { CallbackType } from "../../@types";
import database from "../../database";
export const ranking = new Collection<string, { id: string, balance: number, position: number }>()

export default async (id: string | undefined, type: "user" | "guild" | "client" | "ranking" | undefined, callback: CallbackType): Promise<void> => {

    if (!id || !type) return callback(null)

    if (type === "ranking") return callback(ranking.get(id));

    // const cache = await get(id);
    // if (cache) return callback(cache);

    let data: any = undefined;

    if (type === "guild") data = await database.Guild.findOne({ id }).then(doc => doc?.toObject());
    if (type === "user") data = await database.User.findOne({ id }).then(doc => doc?.toObject());
    if (type === "client") data = await database.Client.findOne({ id }).then(doc => doc?.toObject());

    if (!data) return callback({ id });
    // set(id, data);
    return callback(data);

}

// export async function set(key: string | undefined, value: any) {
//     if (typeof key !== "string" || !value) return;

//     if (typeof value?.Balance === "number")
//         await RedisRanking.zAdd("balance", [{ score: value.Balance || 0, value: key }]);

//     await redis.json.set(
//         key,
//         "$",
//         "toObject" in value ? value.toObject() : value
//     )

//     return await redis.expire(key, 60 * 5);
// }

// export async function get(key: string): Promise<any> {
//     const data = await redis.json.get(key)
//     return data as any
// }

// export async function mGet(keys: string[]): Promise<any[]> {
//     return (await redis.json.mGet(keys, "$") as any[]);
// }
import { Collection } from "discord.js";
import { CallbackType } from "../../@types";
// import { GuildSchema } from "../../database/model/guilds";
// import { UserSchema } from "../../database/model/user";
import database, { redis } from "../../database";
// import { ClientSchema } from "../../database/model/client";
// export const users = new Collection<string, UserSchema>();
// export const guilds = new Collection<string, GuildSchema>();
// export const client = new Collection<string, ClientSchema>();
export const ranking = new Collection<string, { id: string, balance: number, position: number }>()

export default async (id: string | undefined, type: "user" | "guild" | "client" | "ranking" | undefined, callback: CallbackType): Promise<void> => {

    if (!id || !type) return callback(null)

    if (type === "ranking") return callback(ranking.get(id));

    const cache = await redis.json.get(id);
    if (cache) return callback(cache);

    let data: any = undefined;

    if (type === "guild") data = await database.Guild.findOne({ id }).then(doc => doc?.toObject());
    if (type === "user") data = await database.User.findOne({ id }).then(doc => doc?.toObject());
    if (type === "client") data = await database.Client.findOne({ id }).then(doc => doc?.toObject());

    if (!data) return callback({ id });
    set(id, data);
    return callback(data);

}

export async function set(id: string | undefined, value: any) {
    if (!id || !value) return;
    await redis.json.set(id, "$", value);
    await redis.expire(id, 5 * 60);
    return;
}
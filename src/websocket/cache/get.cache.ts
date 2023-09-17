import { Collection } from "discord.js";
import { CallbackType, UserDatabase } from "../../@types";
import { GuildSchema } from "../../database/model/guilds";
export const users = new Collection<string, UserDatabase>();
export const guilds = new Collection<string, GuildSchema>();

export default (id: string | undefined, type: "user" | "guild" | undefined, callback: CallbackType): void => {

    if (!id || !type) return callback(null)

    if (type == "guild") return callback(guilds.get(id))
    if (type == "user") return callback(users.get(id))

    return callback(null)
}
import { Collection } from "discord.js";
import { CallbackType } from "../../@types";
import { GuildSchema } from "../../database/model/guilds";
import { UserSchema } from "../../database/model/user";
export const users = new Collection<string, UserSchema>();
export const guilds = new Collection<string, GuildSchema>();

export default (id: string | undefined, type: "user" | "guild" | undefined, callback: CallbackType): void => {

    if (!id || !type) return callback(null)

    if (type == "guild") return callback(guilds.get(id))
    if (type == "user") return callback(users.get(id))

    return callback(null)
}
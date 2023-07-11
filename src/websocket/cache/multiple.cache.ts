import { Collection } from "discord.js";
import { CallbackType, GuildDatabase, UserDatabase } from "../../@types";
export const users = new Collection<string, UserDatabase>();
export const guilds = new Collection<string, GuildDatabase>();

export default (ids: string[] | undefined, type: "user" | "guild" | undefined, callback: CallbackType): void => {

    if (!ids?.length || !type) return callback([])

    const data = type == "user"
        ? users.filter((v) => ids.includes(v?.id)).toJSON()
        : guilds.filter((v) => ids.includes(v?.id)).toJSON()

    if (type == "guild") return callback(data)
    if (type == "user") return callback(data)

    return callback(null)
}
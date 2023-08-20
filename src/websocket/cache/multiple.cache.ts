import { Collection } from "discord.js";
import { CallbackType, GuildDatabase, UserDatabase } from "../../@types";
import { users, guilds } from "./get.cache";

export default (ids: string[] | undefined, type: "user" | "guild" | undefined, callback: CallbackType): void => {
    if (!ids?.length || !type) return callback([])
    const cache: Collection<string, UserDatabase | GuildDatabase | undefined> = type == "user" ? users : guilds
    return callback(cache.getMany(ids).toJSON().filter(Boolean))
}
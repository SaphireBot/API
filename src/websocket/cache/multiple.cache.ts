import { Collection } from "discord.js";
import { CallbackType, UserDatabase } from "../../@types";
import { users, guilds } from "./get.cache";
import { GuildSchema } from "../../database/model/guilds";

export default (ids: string[] | undefined, type: "user" | "guild" | undefined, callback: CallbackType): void => {
    if (!ids?.length || !type) return callback([])
    const cache: Collection<string, UserDatabase | GuildSchema | undefined> = type == "user" ? users : guilds
    return callback(cache.getMany(ids).toJSON().filter(Boolean))
}
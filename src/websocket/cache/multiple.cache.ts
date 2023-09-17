import { Collection } from "discord.js";
import { CallbackType } from "../../@types";
import { users, guilds } from "./get.cache";
import { GuildSchema } from "../../database/model/guilds";
import { UserSchema } from "../../database/model/user";

export default (ids: string[] | undefined, type: "user" | "guild" | undefined, callback: CallbackType): void => {
    if (!ids?.length || !type) return callback([])
    const cache: Collection<string, UserSchema | GuildSchema | undefined> = type == "user" ? users : guilds
    return callback(cache.getMany(ids).toJSON().filter(Boolean))
}
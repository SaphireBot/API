import { Collection } from "discord.js"
import { users, guilds } from "./get.cache"
import { GuildSchema } from "../../database/model/guilds"
import { UserSchema } from "../../database/model/user"

export default (to: "user" | "guild" | undefined, cacheData: UserSchema[] | GuildSchema[] | undefined) => {

    if (!to || !cacheData?.length || !["user", "guild"].includes(to)) return

    const cache = (to == "user" ? users : guilds) as Collection<string, GuildSchema | UserSchema>
    for (const d of cacheData)
        if (d?.id) cache.set(d?.id, d)
    return
}
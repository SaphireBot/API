import { Collection } from "discord.js"
import { UserDatabase } from "../../@types"
import { users, guilds } from "./get.cache"
import { GuildSchema } from "../../database/model/guilds"

export default (to: "user" | "guild" | undefined, cacheData: UserDatabase[] | GuildSchema[] | undefined) => {

    if (!to || !cacheData?.length || !["user", "guild"].includes(to)) return

    const cache = (to == "user" ? users : guilds) as Collection<string, GuildSchema | UserDatabase>
    for (const d of cacheData)
        if (d?.id) cache.set(d?.id, d)
    return
}
import { Collection } from "discord.js"
import { GuildDatabase, UserDatabase } from "../../@types"
import { users, guilds } from "./get.cache"

export default (to: "user" | "guild" | undefined, cacheData: UserDatabase[] | GuildDatabase[] | undefined) => {

    if (!to || !cacheData?.length || !["user", "guild"].includes(to)) return

    const cache = (to == "user" ? users : guilds) as Collection<string, GuildDatabase | UserDatabase>
    for (const d of cacheData) cache.set(d?.id, d)
    return
}
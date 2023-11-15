import { GuildSchema } from "../../database/model/guilds"
import { UserSchema } from "../../database/model/user"
import { set } from "./get.cache"

export default (to: "user" | "guild" | undefined, cacheData: UserSchema[] | GuildSchema[] | undefined) => {

    if (!to || !cacheData?.length || !["user", "guild"].includes(to)) return

    for (const data of cacheData) set(data?.id, data)
    return
}
import { GuildSchemaType } from "../../database/model/guilds"
import { UserSchemaType } from "../../database/model/user"
import { set } from "./get.cache"

export default (to: "user" | "guild" | undefined, cacheData: UserSchemaType[] | GuildSchemaType[] | undefined) => {

    if (!to || !cacheData?.length || !["user", "guild"].includes(to)) return

    for (const data of cacheData) set((data as any)?.id, data as any)
    return
}
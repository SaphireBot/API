import { GuildDatabase, UserDatabase } from "../../@types"
import { users, guilds } from "./get.cache"

export default (id: string | undefined, type: "user" | "guild" | undefined, data: UserDatabase | GuildDatabase | undefined) => {

    if (!id || !type || !data) return

    if (type == "guild") guilds.set(id, data as GuildDatabase)
    if (type == "user") users.set(id, data as UserDatabase)
    return
}
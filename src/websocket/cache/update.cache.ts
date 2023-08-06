import { GuildDatabase, UserDatabase } from "../../@types"
import { users, guilds } from "./get.cache"

export default (id: string | undefined, to: "user" | "guild" | undefined, data: UserDatabase | GuildDatabase | undefined) => {

    if (!id || !to || !data) return

    if (to == "guild") guilds.set(id, data as GuildDatabase)
    if (to == "user") users.set(id, data as UserDatabase)
    return
}
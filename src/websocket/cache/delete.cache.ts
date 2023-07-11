import { users, guilds } from "./get.cache"

export default (id: string | undefined, type: "user" | "guild" | undefined) => {

    if (!id || !type) return

    if (type == "guild") guilds.delete(id)
    if (type == "user") users.delete(id)
    return
}
import { users, guilds } from "./get.cache"

export default (id: string | undefined, to: "user" | "guild" | undefined) => {

    if (!id || !to) return

    if (to == "guild") guilds.delete(id)
    if (to == "user") users.delete(id)
    return
}
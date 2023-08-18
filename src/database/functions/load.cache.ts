import { GuildDatabase } from "../../@types"
import { guilds } from "../../websocket/cache/get.cache"
import Database from "../index"

export default async () => {
    const guildsData = await Database.Guild.find()
    for (const data of guildsData) if (data.id) guilds.set(data.id, data as GuildDatabase)
}
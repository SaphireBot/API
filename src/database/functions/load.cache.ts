import { GuildDatabase } from "../../@types";
import TwitchManager from "../../twitch/manager.twitch";
import { guilds } from "../../websocket/cache/get.cache";
import Database from "../index";

export default async () => {
    const guildsData = await Database.Guild.find()
    for (const data of guildsData)
        if (data.id) guilds.set(data.id, data as GuildDatabase)

    console.log(`${guilds.size} Guilds Cached`)
    return TwitchManager.getToken()
}
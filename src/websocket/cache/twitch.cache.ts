import Database from "../../database"
import ManagerTwitch from "../../twitch/manager.twitch"
import { guilds } from "./get.cache"

export default async (channelId: string | undefined) => {
    if (!channelId) return

    for (const streamer of ManagerTwitch.streamers) {
        ManagerTwitch.data[streamer] = ManagerTwitch.data[streamer]?.filter(id => id != channelId)
        ManagerTwitch.channelsNotified[streamer] = await Database.Cache.Twitch.pull(`channelsNotified.${streamer}`, cId => [channelId, null].includes(cId))
    }

    await Database.Guild.updateMany(
        {},
        { $pull: { TwitchNotifications: { channelId } } }
    )

    guilds
        .forEach((data, key) => {
            if (data.TwitchNotifications?.length) {
                data.TwitchNotifications = data.TwitchNotifications?.filter(d => d?.channelId !== channelId)
                guilds.set(key, data)
            }
        })

    return
}
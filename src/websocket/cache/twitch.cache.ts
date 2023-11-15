import Database, { redis } from "../../database"
import { GuildSchema } from "../../database/model/guilds"
import ManagerTwitch from "../../twitch/manager.twitch"
import { set } from "./get.cache"

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

    const guilds = (
        await redis.json.mGet(ManagerTwitch.guildsId, "$",) as any
        || await Database.Guild.find({ id: { $in: ManagerTwitch.guildsId } })
    ) as GuildSchema[];

    guilds
        .forEach(data => {
            if (data.TwitchNotifications?.length) {
                data.TwitchNotifications = data.TwitchNotifications?.filter(d => d?.channelId !== channelId)
                set(data.id, data)
            }
        })

    return
}
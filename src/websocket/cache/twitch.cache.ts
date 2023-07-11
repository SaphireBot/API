import { guilds } from "./get.cache"

export default (channelId: string | undefined) => {

    if (!channelId) return

    guilds
        .forEach((data, key) => {
            if (data.TwitchNotifications?.length) {
                data.TwitchNotifications = data.TwitchNotifications?.filter(d => d?.channelId !== channelId)
                guilds.set(key, data)
            }
        })

    return
}
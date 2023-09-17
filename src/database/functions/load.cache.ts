import TwitchManager from "../../twitch/manager.twitch";
// import { guilds, users } from "../../websocket/cache/get.cache";
// import Database from "../index";

export default async () => {
    TwitchManager.getToken()

    // const guildsData = await Database.Guild.find()
    // for (const data of guildsData)
    //     if (data.id) guilds.set(data.id, data.toObject())

    // const usersData = await Database.User.find()
    // for (const user of usersData)
    //     if (user.id) users.set(user.id, user.toObject())

    // console.log(`${guilds.size} Guilds and ${users.size} Users Cached`)
    return 
}
import TwitchManager from "../../twitch/manager.twitch";
import { ranking } from "../../websocket/cache/get.cache";
// import { guilds, users } from "../../websocket/cache/get.cache";
import Database from "../index";

export default async () => {
    TwitchManager.getToken()

    // const guildsData = await Database.Guild.find()
    // for (const data of guildsData)
    //     if (data.id) guilds.set(data.id, data.toObject())

    // for (const data of usersData)
    // ranking.set(data.id, { balance: data.Balance || 0,  })

    // const usersData = await Database.User.find()
    // for (const user of usersData)
    //     if (user.id) users.set(user.id, user.toObject())

    // console.log(`${guilds.size} Guilds and ${users.size} Users Cached`)
    refreshRanking();
    return 
}

async function refreshRanking() {

    const data = await Database.User.find({ Balance: { $exists: true } }, "id Balance")
        .sort({ "Balance": "descending" })

    for (let i = 0; i < data.length; i++)
        ranking.set(data[i]?.id, { balance: data[i]?.Balance || 0, position: i + 1 })

    setTimeout(() => refreshRanking(), 1000 * 60 * 10)
    return
}
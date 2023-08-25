import { shardsAndSockets } from "../websocket/connection";
import { ReminderType } from "../@types/reminder";
import { getTimeout } from "./time.reminder";
import { emojis } from "../json/data.json";
import managerReminder from "./manager.reminder";

export default (data: ReminderType) => {
    if (!data) return
    if (![1, 2, 3].includes(data.interval)) managerReminder.remove(data.id)

    const oneDay = 1000 * 60 * 60 * 24
    const intervalTime = {
        1: oneDay,
        2: oneDay * 7,
        3: oneDay * 30
    }[data.interval]

    const intervalMessage = data.interval == 0
        ? ""
        : `⏱️ | Este lembrete será disparado novamente ${getTimeout(intervalTime, Date.now(), "R")}`

    shardsAndSockets
        .random()
        ?.send({
            type: "notifyUser",
            userId: data.userId,
            content: `${emojis.Notification} | <@${data.userId}>, lembrete pra você.\n🗒️ | **${data.RemindMessage?.slice(0, 3500)}**\n${intervalMessage}`
        })
}
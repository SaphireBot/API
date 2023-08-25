import { ReminderType } from "../@types/reminder";
import { shardsAndSockets } from "../websocket/connection";
import emitReminder from "./emit.reminder";
import ManagerReminder from "./manager.reminder";
import notifyuser from "./notifyuser.reminder";

export default (data: ReminderType) => {

    if (!data?.userId) return

    const RemindMessage = data?.RemindMessage?.slice(0, 3500)

    if (!RemindMessage?.length)
        return ManagerReminder.remove(data.id)

    let responses = 0
    return shardsAndSockets
        .forEach(socket => {
            socket
                ?.timeout(5000)
                .emitWithAck("reminderGuild", { guildId: data.guildId, memberId: data.userId, channelId: data.ChannelId })
                .then(available => {
                    if (!available) {
                        responses++
                        if (responses == shardsAndSockets.size)
                            return notifyuser(data)
                        return
                    }
                    return emitReminder(data)
                })
                .catch(() => { })
        })
}

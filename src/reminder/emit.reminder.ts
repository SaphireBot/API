import { ReminderType } from "../@types/reminder";
// import { messagesToSend } from "../services/message/message.post";
import { getTimeout } from "./time.reminder";
import { emojis as e } from "../json/data.json";
import { siteSocket } from "../websocket/connection";
import notifyUser from "./notifyuser.reminder";
import ManagerReminder from "./manager.reminder";
import { APIMessage, APIMessageComponentEmoji, ButtonStyle, Routes, parseEmoji } from "discord.js";
import { Rest } from "..";

export default async (data: ReminderType) => {

    const oneDay = 1000 * 60 * 60 * 24
    const intervalTime = {
        1: oneDay,
        2: oneDay * 7,
        3: oneDay * 30
    }[data.interval]

    const intervalMessage = data.interval == 0
        ? ""
        : `⏱️ | Este lembrete será disparado novamente ${getTimeout(intervalTime, Date.now(), "R")}`

    data.privateOrChannel
        ? notifyUser(data)
        : emitReminder()

    // data.privateOrChannel
    //     ? notifyUser(data)
    //     : messagesToSend.push({
    //         data: {
    //             channelId: data.ChannelId,
    //             method: "post",
    //             isReminder: true,
    //             content: `${e.Notification} | <@${data.userId}>, lembrete pra você.\n🗒️ | **${data.RemindMessage.slice(0, 3500)}**\n${intervalMessage}`,
    //             components: [1, 2, 3].includes(data.interval)
    //                 ? []
    //                 : [
    //                     {
    //                         type: 1,
    //                         components: [
    //                             {
    //                                 type: 2,
    //                                 label: "+10 Min",
    //                                 emoji: parseEmoji(e.Notification) as APIMessageComponentEmoji,
    //                                 custom_id: JSON.stringify({ c: "rmd", until: Date.now() + (1000 * 60 * 5), src: "snooze", uId: data.userId }),
    //                                 style: ButtonStyle.Primary
    //                             },
    //                             {
    //                                 type: 2,
    //                                 label: "Agendar",
    //                                 emoji: parseEmoji("📅") as APIMessageComponentEmoji,
    //                                 custom_id: JSON.stringify({ c: "rmd", until: Date.now() + (1000 * 60 * 5), src: "revalidate", uId: data.userId }),
    //                                 style: ButtonStyle.Primary
    //                             },
    //                             {
    //                                 type: 2,
    //                                 label: "Deletar",
    //                                 emoji: parseEmoji(e.Trash) as APIMessageComponentEmoji,
    //                                 custom_id: JSON.stringify({ c: "delete", userId: data.userId }),
    //                                 style: ButtonStyle.Danger
    //                             }
    //                         ]
    //                     }
    //                 ],
    //             embeds: []
    //         }
    //     })

    siteSocket?.emit("notification", {
        userId: data.userId,
        message: data.RemindMessage,
        title: "Lembrete"
    })

    // if (data.isAutomatic) return ManagerReminder.remove(data.id)
    // if (intervalTime) return ManagerReminder.revalide(data.id, intervalTime)

    async function emitReminder() {
        await Rest.post(
            Routes.channelMessages(data.ChannelId),
            {
                headers: {
                    "Content-Type": "application/json"
                },
                body: {
                    content: `${e.Notification} | <@${data.userId}>, lembrete pra você.\n🗒️ | **${data.RemindMessage.slice(0, 3500)}**\n${intervalMessage}`,
                    components: [1, 2, 3].includes(data.interval)
                        ? []
                        : [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2,
                                        label: "+10 Min",
                                        emoji: parseEmoji(e.Notification) as APIMessageComponentEmoji,
                                        custom_id: JSON.stringify({ c: "rmd", src: "snooze", uId: data.userId }),
                                        style: ButtonStyle.Primary
                                    },
                                    {
                                        type: 2,
                                        label: "Agendar",
                                        emoji: parseEmoji("📅") as APIMessageComponentEmoji,
                                        custom_id: JSON.stringify({ c: "rmd", src: "revalidate", uId: data.userId}),
                                        style: ButtonStyle.Primary
                                    },
                                    {
                                        type: 2,
                                        label: "Deletar",
                                        emoji: parseEmoji(e.Trash) as APIMessageComponentEmoji,
                                        custom_id: JSON.stringify({ c: "delete", userId: data.userId, reminderId: data.id }),
                                        style: ButtonStyle.Danger
                                    }
                                ]
                            }
                        ]
                }
            }
        )
            .then(res => {
                if (!res) return

                const message = res as APIMessage

                if (!message?.id || !message?.timestamp) return

                if (data.isAutomatic) return ManagerReminder.remove(data.id)
                if (intervalTime) return ManagerReminder.revalide(data.id, intervalTime)
            
                return ManagerReminder.setAlert(data.id, new Date(message.timestamp).valueOf() + (1000 * 60 * 10), message.id)
            })
            .catch(() => notifyUser(data))
        return
    }

    return
}
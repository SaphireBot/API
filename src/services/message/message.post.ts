import { REST, Routes, APIEmbed, MessageReference, MessageComponent } from "discord.js"
import { MessageSaphireRequest, MessageToSendSaphireData } from "../../@types"
import { server } from "../../server"
import { Response } from "express"
import { env } from "process"
const Rest = new REST().setToken(process.env.DISCORD_TOKEN)
const messagesToSend = <MessageToSendSaphireData[]>[]
executeMessages()

server.post("/message", async (req, res) => {

    if (req.headers?.authorization !== env.POST_MESSAGE)
        return res
            .status(401)
            .send("Authorization is not defined correctly.");

    if (!req.body.channelId) {
        res.statusCode = 400
        return res.send("ChannelId is not found.")
    }

    if (!req.body) {
        req.statusCode = 400
        return res.send("Body is not defined.")
    }

    const data = {
        // Out Body Object
        messageId: <string | null>req.body.messageId || null,
        channelId: <string | null>req.body.channelId || null,
        method: <string | null>req.body.method || null,

        // In Body Object
        content: <string | null>req.body.content || null,
        embeds: <APIEmbed[] | []>req.body.embeds || [],
        message_reference: <MessageReference>req.body.message_reference || null,
        components: <MessageComponent[] | []>req.body.components || [],
        tts: false
    }

    return messagesToSend.push({ data, res })
})

async function executeMessages(): Promise<any> {

    if (messagesToSend.length) {
        const toSendData = messagesToSend.slice(0, 40)

        for (const { data, res } of toSendData) {

            if (!data.method) {
                res.send({ message: "No method field provided", data })
                continue
            }

            switch (data.method) {
                case "post": postMessage(data, res); break;
                case "patch": patchMessage(data, res); break;
                case "delete": deleteMessage(data, res); break;
                default: res.send({ message: "No method field provided", data }); break;
            }
            continue;
        }

        messagesToSend.splice(0, toSendData.length)
    }

    return setTimeout(() => executeMessages(), 1000 * 2)
}

async function postMessage(data: MessageSaphireRequest, res: Response) {
    if (!data.channelId) return res.send({ message: "channelId Missing", data })

    return await Rest.post(
        Routes.channelMessages(data.channelId),
        { body: data }
    )
        .then(() => res.sendStatus(200))
        .catch(err => {
            res.statusCode = 400
            return res.send(err)
        })
}

async function patchMessage(data: MessageSaphireRequest, res: Response) {
    if (!data.messageId) return res.send({ message: "messageID missing", data })
    if (!data.channelId) return res.send({ message: "channelId missing", data })

    return await Rest.patch(
        Routes.channelMessage(data.channelId, data.messageId),
        { body: data }
    )
        .then(() => res.sendStatus(200))
        .catch(err => {
            res.statusCode = 400
            return res.send(err)
        })
}

async function deleteMessage(data: MessageSaphireRequest, res: Response) {
    if (!data.messageId) return res.send({ message: "messageId missing", data })
    if (!data.channelId) return res.send({ message: "channelId missing", data })

    return await Rest.delete(
        Routes.channelMessage(data.channelId, data.messageId),
        { body: data }
    )
        .then(() => res.sendStatus(200))
        .catch(err => {
            res.statusCode = 400
            return res.send(err)
        })

}
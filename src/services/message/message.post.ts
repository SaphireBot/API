import { REST, Routes, APIEmbed, MessageReference, MessageComponent } from "discord.js"
import { MessageSaphireRequest, MessageToSendSaphireData } from "../../@types"
import { server } from "../../server"
import { Response } from "express"
import { env } from "process"
import { Socket } from "socket.io"
export const Rest = new REST().setToken(process.env.DISCORD_TOKEN)
export const messagesToSend = <MessageToSendSaphireData[]>[]
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

        for (const { data, res, socket } of toSendData) {

            if (!data.method) {
                report(res, socket, { message: "No method field provided", data })
                continue
            }

            switch (data.method) {
                case "post": postMessage(data, res, socket); break;
                case "patch": patchMessage(data, res, socket); break;
                case "delete": deleteMessage(data, res, socket); break;
                default: report(res, socket, { message: "No method field provided", data }); break;
            }
            continue;
        }

        messagesToSend.splice(0, toSendData.length)
    }

    return setTimeout(() => executeMessages(), 1000 * 2)
}

async function postMessage(data: MessageSaphireRequest, res: Response | undefined, socket: Socket | undefined) {
    if (!data.channelId) return report(res, socket, { message: "channelId Missing", data })

    return await Rest.post(
        Routes.channelMessages(data.channelId),
        { body: data }
    )
        .then(() => {
            if (res) res.end()
            return
        })
        .catch(err => {
            if (socket) return socket.emit("errorInPostingMessage", { data, err })
            if (res) {
                res.statusCode = 400
                return res.send(err)
            }
        })
}

async function patchMessage(data: MessageSaphireRequest, res: Response | undefined, socket: Socket | undefined) {
    if (!data.messageId) return report(res, socket, { message: "messageID missing", data })
    if (!data.channelId) return report(res, socket, { message: "channelId missing", data })

    return await Rest.patch(
        Routes.channelMessage(data.channelId, data.messageId),
        { body: data }
    )
        .then(() => {
            if (res) res.end()
            return
        })
        .catch(err => {
            if (socket) return socket.emit("errorInPostingMessage", { data, err })
            if (res) {
                res.statusCode = 400
                return res.send(err)
            }
        })
}

async function deleteMessage(data: MessageSaphireRequest, res: Response | undefined, socket: Socket | undefined) {
    if (!data.messageId) return report(res, socket, { message: "messageId missing", data })
    if (!data.channelId) return report(res, socket, { message: "channelId missing", data })

    return await Rest.delete(
        Routes.channelMessage(data.channelId, data.messageId),
        { body: data }
    )
        .then(() => {
            if (res) res.end()
            return
        })
        .catch(err => {
            if (socket) return socket.emit("errorInPostingMessage", { data, err })
            if (res) {
                res.statusCode = 400
                return res.send(err)
            }
        })

}

function report(res: Response | undefined, socket: Socket | undefined, data: any) {
    if (socket) socket.emit("errorInPostingMessage", { data, err: data.message })
    if (res) res.send(data)
    return
}
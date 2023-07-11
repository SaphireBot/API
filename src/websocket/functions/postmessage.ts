import { MessageToSendThroughWebsocket } from "../../@types";
import { messagesToSend } from "../../services/message/message.post";
import { Socket } from "socket.io";
import { env } from "process";

export default (data: MessageToSendThroughWebsocket, socket: Socket) => {

    if (!data.body)
        data.body = {
            content: null,
            message_reference: null,
            method: null,
            channelId: null,
            messageId: null,
            components: [],
            embeds: [],
            tts: false
        }

    if (
        data.authorization !== env.POST_MESSAGE
        || !data.channelId
        || !data.method
    )
        return

    if (data.method == "delete" && data.messageId)
        data.body.messageId = data.messageId

    data.body.channelId = data.channelId
    data.body.method = data.method
    return messagesToSend.push({ data: data.body, socket })
}
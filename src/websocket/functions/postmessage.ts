import { Socket } from "socket.io";
import { MessageToSendThroughWebsocket } from "../../@types";
import { messagesToSend } from "../../services/message/message.post";
import { env } from "process";

export default (data: MessageToSendThroughWebsocket, socket: Socket) => {

    const { authorization, body, channelId, method } = data

    if (
        !authorization
        || authorization !== env.POST_MESSAGE
        || !body
        || !channelId
        || !method
    )
        return

    body.channelId = channelId
    body.method = method
    return messagesToSend.push({ data: body, socket })
}
import { CallbackType, MessageSaphireRequest } from "../../@types";
import { Routes } from "discord.js";
import { Rest } from "../../services/message/message.post";

export default (data: MessageSaphireRequest, callback: CallbackType) => {

    if (!data?.channelId) return callback(null)

    return Rest.post(
        Routes.channelMessages(data.channelId),
        { body: data }
    )
        .then(() => callback(true))
        .catch(err => callback(err))
}
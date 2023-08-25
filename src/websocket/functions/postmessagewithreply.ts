import { Rest } from "../../index";
import { CallbackType, MessageSaphireRequest } from "../../@types";
import { Routes } from "discord.js";

export default (data: MessageSaphireRequest, callback: CallbackType) => {

    if (!data?.channelId) return callback(null)

    return Rest.post(
        Routes.channelMessages(data.channelId),
        { body: data }
    )
        .then(() => callback(true))
        .catch(err => callback(err))
}
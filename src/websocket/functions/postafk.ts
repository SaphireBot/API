import { Socket } from "socket.io";
import { AfkGlobalData } from "../../@types";

export default (data: AfkGlobalData, socket: Socket) => {

    if (
        !data
        || !data.userId
        || !data.method
    ) return

    socket.broadcast.emit("globalAfk", { userId: data?.userId, message: data?.message || "No Message", method: data.method })
    return
}
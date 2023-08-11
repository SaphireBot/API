import { Request, Response } from "express";
import { shardsAndSockets } from "../websocket/connection";
import { env } from "process";

export default (req: Request, res: Response) => {

    if (
        req.headers.authorization !== env.TOP_GG_AUTHORIZATION
        || !req.body.user
    )
        return res.sendStatus(200)

    const socket = shardsAndSockets.random()

    if (socket)
        socket.send({ type: "topgg", message: req.body?.user })

    return res.sendStatus(200)
}
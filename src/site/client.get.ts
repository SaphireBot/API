import { Request, Response } from "express";
import { shardsAndSockets } from "../websocket/connection";

export default (_: Request, res: Response) => {

    const timeout = setTimeout(() => res.send(null), 5000)

    shardsAndSockets
        .random()
        ?.timeout(2000)
        .emitWithAck("clientData", "get")
        .then(data => {
            clearTimeout(timeout)
            delete data.SpotifyAccessToken
            delete data.TwitchAccessToken
            return res.send(data)
        })
        .catch(() => { })

}
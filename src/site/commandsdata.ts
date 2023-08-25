import { Request, Response } from "express"
import { commandApi } from "../@types"
import { apiCommandsData, shardsAndSockets } from "../websocket/connection"

export default (_: Request, res: Response) => {

    if (!apiCommandsData.size) {
        shardsAndSockets
            .random()
            ?.timeout(1000)
            .emitWithAck("commands", "get")
            .then((cmds: commandApi[]) => {
                if (!cmds?.length) return
                for (const cmd of cmds)
                    apiCommandsData.set(cmd.name, cmd)

                return res.send(apiCommandsData.toJSON())
            })
            .catch(() => res.send([]))
        return
    }

    return res.send(apiCommandsData.toJSON())
}
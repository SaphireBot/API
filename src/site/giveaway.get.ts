import { Request, Response } from "express";
import { shardsAndSockets } from "../websocket/connection";
import { GiveawayResponseData } from "../@types";

export default (req: Request, res: Response) => {

    const { giveawayId } = req.params

    if (!giveawayId) return res.status(400).send({ message: "O ID do sorteio não foi definido corretamente." })
    const timeout = setTimeout(() => res.status(404).send({ message: "O Discord demorou demais para entregar os participantes do sorteio." }), 1000 * 20)
    const size = shardsAndSockets.size
    let responses = 0

    for (const socket of shardsAndSockets.values())
        socket
            .timeout(10000)
            .emitWithAck("getGiveaway", giveawayId)
            .then((data: GiveawayResponseData) => {
                responses++

                if (!data) {
                    if (size == responses) {
                        clearTimeout(timeout)
                        return res.status(404).send({ message: "Infelizmente, o sorteio não foi encontrado.", data })
                    }
                    return
                }

                clearTimeout(timeout)
                return res.send(data)
            })
            .catch(() => null)

    return
}
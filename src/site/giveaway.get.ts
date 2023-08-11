import { Request, Response } from "express";
import { shardsAndSockets } from "../websocket/connection";
import { GiveawayResponseData } from "../@types";

export default (req: Request, res: Response) => {

    const { giveawayId, guildId } = req.params

    if (!giveawayId || !guildId) return res.status(400).send({ message: "O ID do servidor ou do Sorteio não foram definidos corretamente." })
    const timeout = setTimeout(() => res.status(404).send({ message: "O Discord demorou demais para entregar os participantes do sorteio." }), 1000 * 10)
    const size = shardsAndSockets.size
    let responses = 0

    for (const socket of shardsAndSockets.values())
        socket
            .timeout(7000)
            .emitWithAck("getGuildAndGiveaway", { guildId, giveawayId })
            .then((data: GiveawayResponseData) => {
                responses++

                if (!data) {
                    if (size == responses) {
                        clearTimeout(timeout)
                        console.log(data)
                        return res.status(404).send({ message: "Infelizmente, o sorteio não foi encontrado.", data })
                    }
                    return
                }

                const { giveaway, guild } = data

                if (!giveaway || !guild) {
                    clearTimeout(timeout)
                    return res.status(404).send({ message: "Os dados deste sorteio foram entregues, porém, incompletos.", data })
                }

                if (giveaway && guild) {
                    clearTimeout(timeout)
                    return res.send(data)
                }
            })
            .catch(() => null)

    return
}
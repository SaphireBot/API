import { Request, Response } from "express";
// import { shardsAndSockets } from "../websocket/connection";
import { env } from "process";
import { DiscordSnowflake } from "@sapphire/snowflake"
import Database from "../database";
import { users } from "../websocket/cache/get.cache";
import { UserDatabase } from "../@types";

export default async (req: Request, res: Response) => {

    if (req.headers?.authorization !== env.LINKED_ROLES_AUTHORIZATION)
        return res.send({ message: "Nenhuma autorização foi definida." })

    const { tokens, userId, notResponse } = JSON.parse(req.headers.data as string)

    if (!tokens || !userId)
        return res.send({ message: "userId ou tokens não definidos." })

    if (notResponse) return res.sendStatus(200)

    return await Database.User.findOneAndUpdate(
        { id: userId }, { $set: { Tokens: tokens } },
        { upsert: true, new: true }
    )
        .then(doc => {
            users.set(doc?.id, doc as UserDatabase)

            return res.send({
                id: doc.id,
                Balance: doc.Balance,
                Level: doc.Level,
                Likes: doc.Likes,
                createdAt: new Date(DiscordSnowflake.timestampFrom(userId)), // CARALHO!
                Tokens: doc.Tokens
            })
        })
        .catch(err => res.send({ message: "Não foi possível editar os dados solicitados", err: err?.message }))

    // return shardsAndSockets
    //     .random()
    //     ?.timeout(7000)
    //     .emitWithAck("setTokens", { userId, tokens })
    //     .then(data => {

    //         if (notResponse) return res.sendStatus(200)

    //         if (!data)
    //             return res
    //                 .send({ message: "Nenhuma resposta foi encontrada." })

    //         if (data.message)
    //             return res.send(data)

    //         return res.send(data)
    //     })
    //     .catch(err => res.status(500).send({ message: "Erro ao salvar os dados solicitados.", err: err?.message }))

}
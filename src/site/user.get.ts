import { Request, Response } from "express";
import { env } from "process";
// import { shardsAndSockets } from "../websocket/connection";
import Database from "../database";
import { users } from "../websocket/cache/get.cache";
import { UserDatabase } from "../@types";

export default async (req: Request, res: Response) => {

    const { userId } = req.params
    const { name, data } = req.query
    const fields = req.query.field

    if (!userId)
        return res.status(400).send({ message: "ID do usuário não informado. Exemplo: .../user/userId" })

    if (name == "true" || data == "true") {
        await fetch(
            `https://discord.com/api/v10/users/${userId}`,
            {
                headers: { authorization: `Bot ${env.BOT_TOKEN_REQUEST}` },
                method: "GET"
            }
        )
            .then(res => res.json())
            .then(data => {
                if (name) return res.send(data.username)
                if (data) return res.send(data)
            })
            .catch(() => res.send("No Name"))
        return
    }

    const doc = await Database.User.findOne({ id: userId })
    if (!doc) return res.send({ message: "Nenhuma informação foi encontrada no banco de dados." })
    users.set(doc?.id, doc as UserDatabase)
    if (!fields) return res.send(doc)

    const userData: Record<string, any> = {}

    if (Array.isArray(fields))
        for (const key of fields) {
            if (doc[key as keyof UserDatabase]) userData[key as keyof UserDatabase] = doc[key as keyof UserDatabase]
        }
    else if (doc[fields as keyof UserDatabase]) userData[fields as keyof UserDatabase] = doc[fields as keyof UserDatabase]

    return res.send(userData)

}
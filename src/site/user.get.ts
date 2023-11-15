import { Request, Response } from "express";
import { env } from "process";
// import { shardsAndSockets } from "../websocket/connection";
import Database, { redis } from "../database";
import { UserSchema } from "../database/model/user";
import { set } from "../websocket/cache/get.cache";

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

    let doc = await redis.json.get(userId) as any;

    if (!doc) {
        const d = await Database.User.findOne({ id: userId });
        if (d?.id) set(d?.id, d);
        doc = d;
    }

    if (!doc) return res.send({ message: "Nenhuma informação foi encontrada no banco de dados." })

    if (!fields) return res.send(doc)

    const userData: Record<string, any> = {}

    if (Array.isArray(fields))
        for (const key of fields) {
            if (doc[key as keyof UserSchema]) userData[key as keyof UserSchema] = doc[key as keyof UserSchema]
        }
    else if (doc[fields as keyof UserSchema]) userData[fields as keyof UserSchema] = doc[fields as keyof UserSchema]

    return res.send(userData)

}
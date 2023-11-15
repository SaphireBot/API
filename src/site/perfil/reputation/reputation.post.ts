import { Request, Response } from "express";
import Database, { redis } from "../../../database";
import managerTwitch from "../../../twitch/manager.twitch";
import { siteSocket } from "../../../websocket/connection";
import { UserSchema } from "../../../database/model/user";
import { set } from "../../../websocket/cache/get.cache";

export default async (req: Request<{ from: string | undefined, text: string | undefined, to: string | undefined, username: string | undefined, date: number | undefined }>, res: Response) => {

    const { from, text, to, username, date: dateNow } = req.body

    if (!from || !text || !to || !dateNow)
        return res.status(400).send({ message: "Content Missing" })

    let userdata = (await redis.json.get(from) as any) as UserSchema

    if (!userdata) {
        const doc = await Database.User.findOne({ id: from });
        if (doc?.id) set(doc.id, doc)
        userdata = doc?.toObject() as any;
    }

    set(from, userdata)

    const remaingDate = (((userdata?.Timeouts?.Reputation || 0) + (1000 * 60 * 60 * 2)) - dateNow)
    if (remaingDate > 0)
        return res.status(400).send({ status: 200, type: "timeout", message: `Você só pode mandar outra requisição em ${managerTwitch.stringDate(remaingDate)}` })

    const saved = {
        from: false,
        to: false,
        return: false
    }

    await Database.User.updateOne(
        { id: to },
        {
            $push: {
                "Perfil.Reputation": {
                    $each: [{ from, text, date: dateNow, username }],
                    $position: 0
                }
            }
        },
        { upsert: true }
    )
        .then(() => saved.to = true)
        .catch(() => saved.return = true)

    await Database.User.updateOne(
        { id: from },
        { $set: { "Timeouts.Reputation": dateNow } },
        { upsert: true }
    )
        .then(() => saved.to = true)
        .catch(() => saved.return = true)

    if (saved.return) return res.status(500).send({ status: 200, type: "partial", message: "Os dados foram salvos particialmente." })

    siteSocket?.emit("reputation", { userId: to, reputations: (await redis.json.get(to) as any)?.Perfil?.Reputation || [] })
    siteSocket?.emit("notification", { userId: to, message: `Você recebeu uma <a href='https://saphire.one/perfil'>reputação</a> de ${username}` })
    return res.status(200).send({
        status: 200,
        type: "success",
        message: `Muito bem! Você pode enviar outra reputação em ${managerTwitch.stringDate(1000 * 60 * 60 * 2)}`,
        reputations: (await redis.json.get(to) as any)?.Perfil?.Reputation || []
    })
}
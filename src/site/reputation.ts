import { Request, Response } from "express";
import Database from "../database";
import { users } from "../websocket/cache/get.cache";
import { UserDatabase } from "../@types";
import managerTwitch from "../twitch/manager.twitch";

export default async (req: Request<{ from: string | undefined, text: string | undefined, to: string | undefined, username: string | undefined, date: number | undefined }>, res: Response) => {

    const { from, text, to, username, date: dateNow } = req.body

    if (!from || !text || !to || !dateNow)
        return res.status(400).send({ message: "Content Missing" })

    const userdata = users.get(from) || await Database.User.findOne({ id: from })
    users.set(from, userdata as UserDatabase)

    const remaingDate = (((userdata?.Timeouts?.Reputation || 0) + (1000 * 60 * 60 * 2)) - dateNow)
    if (remaingDate > 0)
        return res.status(400).send({ status: 200, type: "timeout", message: `Você só pode mandar outra requisição em ${managerTwitch.stringDate(remaingDate)}` })

    const saved = {
        from: false,
        to: false,
        return: false
    }

    await Database.User.findOneAndUpdate(
        { id: to },
        {
            $push: {
                "Perfil.Reputation": {
                    $each: [{ from, text, date: dateNow, username }],
                    $position: 0
                }
            }
        },
        { new: true, upsert: true }
    )
        .then(doc => {
            users?.set(doc?.id, doc as UserDatabase)
            saved.to = true
        })
        .catch(() => saved.return = true)

    await Database.User.findOneAndUpdate(
        { id: from },
        { $set: { "Timeouts.Reputation": dateNow } },
        { new: true, upsert: true }
    )
        .then(doc => {
            users?.set(doc?.id, doc as UserDatabase)
            saved.to = true
        })
        .catch(() => saved.return = true)

    if (saved.return) return res.status(500).send({ status: 200, type: "partial", message: "Os dados foram salvos particialmente." })
    return res.status(200).send({ status: 200, type: "success", message: `Muito bem! Você pode enviar outra reputação em ${managerTwitch.stringDate(1000 * 60 * 60 * 2)}`, })
}
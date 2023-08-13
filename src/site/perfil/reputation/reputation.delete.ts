import { Request, Response } from "express";
import Database from "../../../database";
import { users } from "../../../websocket/cache/get.cache";
import { UserDatabase } from "../../../@types";

export default async (req: Request, res: Response) => {

    // Who wrote the reputation
    const from = req.query.from as string | undefined

    // When the reputation was sended and the Rep's ID
    const date = req.query.date as number | undefined

    // The profile owner's ID
    const userId = req.query.userId as string | undefined

    // Who is requesting the delete
    const requesting = req.query.requesting as string | undefined
    console.log(from, date, userId, requesting)

    if (!from || !date || !userId || !requesting)
        return res.status(400).send({ message: "Date, From, UserId, Requesting field is missing" })

    const userdata = users.get(userId) || await Database.User.findOne({ id: userId })
    if (!userdata) return res.send({ type: "notfound", message: "Nenhum usuário foi encontrado." })

    const reputation = userdata?.Perfil?.Reputation?.find(rep => rep?.date == date)
    if (!reputation) return res.send({ type: "notfound", message: "Esta reputação não foi encontrada." })

    /**
     * Can delete any reputation in own profile
     * Can delete any reputation that they send
     */
    if (requesting === userId || requesting === from) return deleteReputation()

    return res.send({ type: "notYourReputation", message: "Você não pode deletar esta reputação." })

    async function deleteReputation() {
        return await Database.User.findOneAndUpdate(
            { id: userId },
            { $pull: { "Perfil.Reputation": { date: `${date}` } } },
            { upsert: true, new: true }
        )
            .then(doc => {
                users.set(doc?.id, doc as UserDatabase)
                return res.send({ type: "success", message: "Reputação deletada com succeso." })
            })
            .catch(err => res.send({ type: "error", message: err }))
    }

}
import { Request, Response } from "express";
import Database, { redis } from "../../../database";
import { siteSocket } from "../../../websocket/connection";
import { UserSchema } from "../../../database/model/user";

export default async (req: Request, res: Response) => {

    // Who wrote the reputation
    const from = req.query.from as string | undefined

    // When the reputation was sended and the Rep's ID
    const date = Number(req.query.date || 0)

    // The profile owner's ID
    const userId = req.query.userId as string | undefined

    // Who is requesting the delete
    const requesting = req.query.requesting as string | undefined

    if (!from || !date || !userId || !requesting)
        return res.status(400).send({ type: "error", message: "Date, From, UserId, Requesting field is missing" })

    const userdata = await redis.json.get(userId) || await Database.User.findOne({ id: userId }) as UserSchema
    if (!userdata) return res.send({ type: "notfound", message: "Nenhum usuário foi encontrado." })

    const reputation = (userdata as any)?.Perfil?.Reputation?.find((rep: any) => rep?.date == date)
    if (!reputation) return res.send({ type: "notfound", message: "Esta reputação não foi encontrada.", reputations: (userdata as any)?.Perfil?.Reputation || [] })

    /**
     * Can delete any reputation in own profile
     * Can delete any reputation that they send
     */
    if (requesting === userId || requesting === from) return deleteReputation()

    return res.send({ type: "notYourReputation", message: "Você não pode deletar esta reputação." })

    async function deleteReputation() {
        return await Database.User.findOneAndUpdate(
            { id: userId },
            { $pull: { "Perfil.Reputation": { date: date } } },
            { upsert: true, new: true }
        )
            .then(doc => {
                siteSocket?.emit("reputation", { userId, reputations: doc?.Perfil?.Reputation || [] })
                siteSocket?.emit("notification", { userId, message: "Você perdeu uma <a href='https://saphire.one/perfil'>reputação</a>" })
                return res.send({
                    type: "success",
                    message: "Reputação deletada com sucesso.",
                    reputations: doc?.Perfil?.Reputation || []
                })
            })
            .catch(err => res.send({ type: "error", message: err?.message }))
    }

}
import { Request, Response } from "express"
import { shardsAndSockets } from "../websocket/connection"
import Database from "../database"
import { UserDatabase } from "../@types"
import { users } from "../websocket/cache/get.cache"

export default async (req: Request<{ field: keyof UserDatabase | undefined, userId: string | undefined }>, res: Response) => {

    const { field, userId } = req.params

    if (!userId || !field)
        return res.status(400).send({ message: "Campo do banco de dados não informado. Exemplo: .../user/transactions" })

    if (!shardsAndSockets.size)
        return res.status(500).send({ message: "Nenhum socket está conectado com a Saphire BOT." })

    const doc = await Database.User.findOne({ id: userId })
    if (!doc) return res.send({ message: "Nenhuma informação foi encontrada no banco de dados." })
    users.set(doc?.id, doc as UserDatabase)
    return res.send(doc[field])

    return shardsAndSockets
        .random()
        ?.timeout(5000)
        .emitWithAck("getDatabaseInfo", { field, userId })
        .then(data => {

            if (!data)
                return res
                    .status(404)
                    .send({ message: "Nenhuma informação foi encontrada." })

            if (data.message) return res.send(data)

            return res.send(data)
        })
        .catch(err => res.status(404).send({ message: "Erro ao obter os dados solicitados.", err: err?.message }))
}
import { Request, Response } from "express"
import { env } from "process"

export default async (req: Request, res: Response) => {
    const authorization = req.headers?.authorization

    if (!authorization || authorization !== env.DISCORD_TOKEN)
        return res.send({ status: 401, message: "Missing Token Access" })

    return await fetch(
        "https:/saphire.one/shardzero",
        {
            method: "POST",
            headers: {
                authorization: env.DISCORD_TOKEN,
                "Content-Type": "application/json"
            },
            body: req.body
        }
    )
        .then(value => res.sendStatus(value.status))
        .catch(err => {
            console.log(err)
            return res.sendStatus(412)
        })
}
import { Request, Response } from "express";
import { env } from "process";

export default async (req: Request, res: Response) => {

    const { CreatedBy, Sponsor } = req.params

    const data = {
        CreatedBy: {},
        Sponsor: {}
    }

    await fetch(`https://discord.com/api/users/${CreatedBy}`, {
        method: "GET",
        headers: { authorization: `Bot ${env.BOT_TOKEN_REQUEST}` }
    })
        .then(data => data.json())
        .then(user => data.CreatedBy = user as any)
        .catch(() => ({ username: null }))

    await fetch(`https://discord.com/api/users/${Sponsor}`, {
        method: "GET",
        headers: {
            authorization: `Bot ${env.BOT_TOKEN_REQUEST}`
        }
    })
        .then(data => data.json())
        .then(user => data.Sponsor = user as any)
        .catch(() => ({ username: null }))

    return res.send(data)
}
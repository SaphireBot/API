import { Request, Response } from "express";
import { env } from "process";
import { APIUser, Collection } from "discord.js";
const cache = new Collection<string, APIUser>()
const tokens = [
    env.BOT_TOKEN_REQUEST,
    env.BOT_USERS_TOKEN_REQUEST,
    env.REQUESTER1
]

export default async (req: Request, res: Response) => {

    const id = req.query.id as string | string[]
    const token = () => tokens[Math.floor(Math.random() * tokens.length)]

    if (Array.isArray(id)) return fetcher()

    if (cache.has(id))
        return res.send([cache.get(id)])

    await fetch(
        `https://discord.com/api/v10/users/${id}`,
        { headers: { authorization: `Bot ${token()}` } }
    )
        .then(res => res.json())
        .then((data: APIUser) => {
            set(data)
            return res.send([data])
        })
        .catch(err => res.status(500).send(err))

    async function fetcher() {

        const ids = Array.from(new Set(id.slice(0, 10)))
        console.log(ids)
        let gets = 0
        const usersData: APIUser[] = []

        for (const userId of ids) {

            const cached = cache.get(userId)
            if (cached) {
                usersData.push(cached)
                verifyAndSend()
                continue
            }

            fetch(
                `https://discord.com/api/v10/users/${userId}`,
                { headers: { authorization: `Bot ${token()}` } }
            )
                .then(res => res.json())
                .then((data: APIUser) => {
                    set(data)
                    if (data?.id) usersData.push(data)
                    verifyAndSend()
                })
                .catch(() => verifyAndSend())

        }
        function verifyAndSend() {
            gets++
            if (gets !== ids?.length) return
            return res.send(usersData)
        }

    }

    function set(data: APIUser | undefined) {
        if (!data?.id) return
        if (!cache.has(data?.id)) setTimeout(() => cache.delete(data?.id), 1000 * 60 * 60)
        cache.set(data?.id, data)
        return
    }
}
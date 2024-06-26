import { Request, Response } from "express";
import { env } from "process";
import { APIUser } from "discord.js";
// import { RedisUsers } from "../database";
const cache = new Map<string, APIUser>();
const tokens = [
    env.BOT_TOKEN_REQUEST,
    env.BOT_USERS_TOKEN_REQUEST,
    env.REQUESTER1
]

export default async (req: Request, res: Response) => {

    const id = (() => {
        if (!req.body) return undefined;
        if (!Array.isArray(req.body)) return undefined;
        return Array.from(new Set(req.body));
    })() || (req.query.id || req.path?.split("/")?.pop()) as string | string[]
    const token = () => tokens[Math.floor(Math.random() * tokens.length)]
    if (!id) return res.send([]);

    if (Array.isArray(id)) return await fetcher()
    const cached = cache.get(id);
    if (cached) return res.send([cached]);

    await fetch(
        `https://discord.com/api/v10/users/${id}`,
        { headers: { authorization: `Bot ${token()}` } }
    )
        .then(res => res.json())
        .then(data => {
            // set(data as any)

            cache.set((data as any).id, data as APIUser);
            return res.send([data])
        })
        .catch(err => res.status(500).send(err))

    async function fetcher() {

        const ids = Array.from(new Set(id.slice(0, 40)))
        let gets = 0
        const usersData: APIUser[] = []

        // const data = ((await RedisUsers.json.mGet(ids, "$") as any) as APIUser[][])?.flat()?.filter(d => d?.id);
        // if (data?.length)
        //     for (const d of data)
        //         if (d?.id)
        //             usersData.push(d)

        for (const userId of ids) {

            if (usersData.some(d => d.id === userId)) {
                verifyAndSend();
                continue;
            }

            fetch(
                `https://discord.com/api/v10/users/${userId}`,
                { headers: { authorization: `Bot ${token()}` } }
            )
                .then(res => res.json())
                .then(data => {
                    // set(data as any)
                    if ((data as any)?.id) usersData.push(data as any)
                    cache.set((data as any).id, data as APIUser);
                    verifyAndSend()
                })
                .catch(() => verifyAndSend())

        }

        function verifyAndSend() {
            gets++
            if (gets !== ids?.length) return
            return res.send(usersData);
        }

    }

    // async function set(data: APIUser | undefined) {
    // if (!data?.id) return;
    // await RedisUsers.json.set(data.id, "$", { ...data });
    // await RedisUsers.expire(data.id, 86400);
    // return;
    // }
}
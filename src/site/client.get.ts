import { Request, Response } from "express";
import database, { redis } from "../database";
import { env } from "process";
import { ClientSchema } from "../database/model/client";
import { set } from "../websocket/cache/get.cache";

export default async (_: Request, res: Response) => {

    const cache = (await redis.json.get(env.SAPHIRE_BOT_ID) as any) as ClientSchema;
    if (cache) {
        for (const key of Object.keys(cache || {}))
            if (key?.toLowerCase()?.includes("token"))
                delete cache[key as keyof typeof cache];
        if (cache) return res.json(cache)
    }

    const data = await database.Client.findOne({ id: env.SAPHIRE_BOT_ID });
    if (data) {
        for (const key of Object.keys(data || {}))
            if (key?.toLowerCase()?.includes("token"))
                delete cache[key as keyof typeof data];
        set(env.SAPHIRE_BOT_ID, data?.toObject())
        return res.json(data);
    }

    return res.send({});
}
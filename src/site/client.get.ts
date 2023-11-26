import { Request, Response } from "express";
import database, { redis } from "../database";
import { env } from "process";
import { ClientSchema } from "../database/model/client";
import { set } from "../websocket/cache/get.cache";

export default async (_: Request, res: Response) => {

    const cache = (await redis.json.get(env.SAPHIRE_BOT_ID) as any) as ClientSchema;
    if (cache) {
        delete cache.SpotifyAccessToken
        delete cache.TwitchAccessToken
        delete cache.TwitchAccessTokenSecond
        delete cache.TwitchAccessTokenThird
        delete cache.TwitchAccessTokenFourth
        if (cache) return res.json(cache)
    }

    const data = await database.Client.findOne({ id: env.SAPHIRE_BOT_ID });
    if (data) {
        delete data.SpotifyAccessToken
        delete data.TwitchAccessToken
        delete data.TwitchAccessTokenSecond
        delete data.TwitchAccessTokenThird
        delete data.TwitchAccessTokenFourth
        set(env.SAPHIRE_BOT_ID, data?.toObject())
        return res.json(data);
    }

    return res.send({});
}
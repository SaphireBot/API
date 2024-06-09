import { Request, Response } from "express";
import database from "../database";
import { env } from "process";
// import { ClientSchemaType } from "../database/model/client";

export default async (_: Request, res: Response) => {

    // const cache = (await redis.json.get(env.SAPHIRE_ID) as any) as ClientSchemaType;
    // if (cache) {
    //     for (const key of Object.keys(cache || {}))
    //         if (key?.toLowerCase()?.includes("token"))
    //             delete cache[key as keyof typeof cache];
    //     if (cache) return res.json(cache)
    // }

    const data = await database.Client.findOne({ id: env.SAPHIRE_ID });
    if (data) {
        for (const key of Object.keys(data || {}))
            if (key?.toLowerCase()?.includes("token"))
                delete data[key as keyof typeof data];
        return res.json(data);
    }

    return res.send({});
}
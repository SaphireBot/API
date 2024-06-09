import { Request, Response } from "express";
import { env } from "process";
import database from "../database";

export default async (req: Request, res: Response) => {

    if (
        req.headers.authorization !== env.TOP_GG_AUTHORIZATION
        || !req.body.user
    )
        return res.sendStatus(200)

    res.sendStatus(200);
    await database.Vote.updateOne({ userId: req.body?.user }, { $set: { voted: true } }, { upsert: true });
    await database.User.updateOne(
        { id: req.body.user },
        { $set: { "Timeouts.TopGGVote": Date.now() + ((60 * 1000) * 60) * 12 } },
        { upsert: true }
    )
}
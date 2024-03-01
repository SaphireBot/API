import { Request, Response } from "express";
import database from "../database";

export default async function save_login(req: Request, res: Response) {

    const data = req?.body;
    if (!data?.Tokens || !data?.id) return res.send({ message: "no data given", data });

    await database.User.updateOne(
        { id: data.id },
        {
            $set: {
                email: data.email,
                "Tokens.access_token": data.Tokens.access_token,
                "Tokens.token_type": data.Tokens.token_type,
                "Tokens.expires_in": data.Tokens.expires_in
            }
        },
        { upsert: true }
    );

    return res.send({
        message: "Login saved",
        data
    });
}
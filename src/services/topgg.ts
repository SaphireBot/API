import { env } from "node:process";
import { TopGGWebhookPostResult } from "../@types";
import { request } from "undici"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async (req: any, res: any) => {

    if (req.headers?.authorization !== env.TOP_GG_AUTHORIZATION)
        return res
            .status(401)
            .send("Authorization is not defined correctly.");

    const { bot, user, type } = <TopGGWebhookPostResult>req.body

    if (bot !== "912509487984812043")
        return res
            .status(400)
            .send("It's a bad request");

    if (type === "test")
        return res
            .status(302)
            .send("Test completed successfully");

    if (!/(\d{17,})/.test(user))
        return res
            .status(406)
            .send("Content is not acceptable");

    return await request("https://saphire.discloud.app/topgg", {
        method: "POST",
        headers: {
            user: user
        }
    })
        .then(() => res
            .status(200)
            .send("Ok")
        )
        .catch(err => res
            .status(500)
            .send(err || "Internal Server Error Not Found")
        )
}
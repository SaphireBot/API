import { request } from "undici";
import { env } from "node:process";

// Código não testado
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function (req: any, res: any) {

    const { webhookUrl, content, embeds } = req.body

    if (req.headers?.authorization !== env.WEBHOOK_ACESS)
        return res
            .status(401) // Unauthorized
            .send("Unauthorized");

    if (!webhookUrl)
        return res
            .status(204) // No Content
            .send({ status: "Unknown Webhook URL" })

    if (!content && (!embeds || embeds.length === 0))
        return res
            .status(204) // No Content
            .send({ status: "Unknown Content and Embeds" })

    if (!Array.isArray(embeds))
        return res
            .status(406) // Not Acceptable
            .send({ status: "Embeds is not an array" })

    if (typeof content != "string")
        return res
            .status(406) // Not Acceptable
            .send({ status: "Embeds is not an array" })

    return await request(webhookUrl, {
        method: "POST",
        headers: { content, embeds }
    })
        .then(() => res.status(200).send(true)) // Ok
        .catch(err => res.status(400).send(err)) // Bad Request

}
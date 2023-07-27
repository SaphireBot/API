import { APIWebhook } from "discord.js"
import { env } from "process"
import check from "./check"

export default async (): Promise<void> => {

    let webhookUrl: string | undefined

    const webhooks: APIWebhook[] = await fetch(
        "https://discord.com/api/v10/channels/1108932715673301043/webhooks",
        {
            method: "GET",
            headers: {
                authorization: `Bot ${env.BOT_TOKEN_REQUEST}`
            }
        }
    )
        .then(data => data.json())
        .catch(() => [])

    webhookUrl = webhooks?.find(webhook => webhook?.user?.id == "1035037311907405834")?.url

    if (!webhookUrl)
        webhookUrl = await createWebhook()

    if (!webhookUrl) return

    check(webhookUrl)
    return;
}

async function createWebhook(): Promise<string | undefined> {

    const webhook = await fetch(
        "https://discord.com/api/v10/channels/1108932715673301043/webhooks",
        {
            method: "POST",
            headers: {
                authorization: `Bot ${env.BOT_TOKEN_REQUEST}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: "Saphire Webook Status"
            })
        }
    )
        .then(data => data.json())
        .catch(err => {
            console.log(err)
            return undefined
        })

    return webhook?.url
}
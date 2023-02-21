import axios from "axios"
import databaseBackup from "./database.backup"
import { WebhookClient, APIMessage } from "discord.js"
import { env } from "process"
import { DiscordWebhook } from "../../@types"
import { emojis } from "../../json/data.json"
let webhook: WebhookClient | undefined;
let message: APIMessage | undefined;

async function execute(): Promise<void> {

    const webhookFetch: DiscordWebhook[] = await axios.get("https://discord.com/api/v10/channels/1036298713691328614/webhooks", {
        headers: {
            authorization: `Bot ${env.BOT_TOKEN_REQUEST}`
        }
    })
        .then(data => data.data)
        .catch(() => [])

    let apiWebhook: DiscordWebhook | undefined = webhookFetch.find(wh => wh?.user?.username == "Saphire API")

    if (!apiWebhook)
        apiWebhook = await axios({
            url: "https://discord.com/api/v10/channels/1036298713691328614/webhooks",
            method: "POST",
            headers: {
                authorization: `Bot ${env.BOT_TOKEN_REQUEST}`
            },
            data: {
                name: "[API] Database Backup Manager"
            }
        })
            .then(response => {
                return response.data as DiscordWebhook
            })
            .catch(err => {
                console.log(err)
                return undefined
            })

    if (apiWebhook && apiWebhook?.token) {
        env.WEBHOOK_STATUS = `https://discord.com/api/webhooks/${apiWebhook?.id}/${apiWebhook.token}`
        webhook = new WebhookClient({ url: env.WEBHOOK_STATUS as string })

        message = await webhook.send({
            content: `${emojis.loading} Inicializando o backup do banco de dados...`,
            username: "[API] Database Backup Manager",
            avatarURL: env.WEHBHOOK_SYSTEM_AVATAR
        })
            .catch(() => undefined)
    }

    return await databaseBackup()
}

export { webhook, execute, message }
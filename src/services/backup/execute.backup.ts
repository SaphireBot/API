import databaseBackup from "./database.backup"
import { WebhookClient, APIMessage, REST, Routes } from "discord.js"
import { env } from "process"
import { DiscordWebhook } from "../../@types"
import { emojis } from "../../json/data.json"
import { readFileSync } from "fs"
const avatar = readFileSync("./src/images/webhook_logo.png", { encoding: "base64" })
let webhook: WebhookClient | undefined;
let message: APIMessage | undefined;
const request = new REST().setToken(process.env.BOT_TOKEN_REQUEST)

async function execute(): Promise<void> {

    const webhookFetch: DiscordWebhook[] | unknown = await request.get(Routes.channelWebhooks(env.CHANNEL_WEBHOOK_STATUS!)).catch(() => [])

    let apiWebhook: DiscordWebhook = Array.isArray(webhookFetch)
        ? webhookFetch.find(wh => wh?.user?.username == "Saphire API")
        : undefined

    if (!apiWebhook)
        apiWebhook = <DiscordWebhook>await request.post(Routes.channelWebhooks(env.CHANNEL_WEBHOOK_STATUS!), {
            body: {
                name: "[API] Database Backup Manager",
                avatar: `data:image/png;base64,${avatar}`,
            },
            headers: { "Content-Type": "image/png" }
        })
            .catch(() => undefined)

    if (apiWebhook && apiWebhook.token) {
        env.WEBHOOK_STATUS = `https://discord.com/api/webhooks/${apiWebhook?.id}/${apiWebhook.token}`
        webhook = new WebhookClient({ url: env.WEBHOOK_STATUS as string })

        message = await webhook.send({
            content: `${emojis.loading} Inicializando o backup do banco de dados...`,
            username: "[API] Database Backup Manager"
        })
            .catch(() => undefined)
    }

    return await databaseBackup()
}

export { webhook, execute, message }
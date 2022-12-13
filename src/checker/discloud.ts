import axios from "axios"
import sender from "../webhooks/sender"
import dataJSON from "../json/data.json"
import initCheckerInterval from "./index"
import squarecloud from "./squarecloud"
import { env } from "process"
import { SaphireApiBotResponse } from "../@types"

export default async (): Promise<void> => {

    sender({
        url: env.WEBHOOK_STATUS,
        content: "📡 | Aplicação se encontra offline na Host Squarecloud. Contactando Host Discloud.",
        avatarURL: "https://media.discordapp.net/attachments/893361065084198954/1018699630998986752/data-management.png?width=473&height=473",
        username: "[API] Saphire Status | OFFLINE"
    }).catch(() => null)

    const req: SaphireApiBotResponse | null = await axios.get("https://saphire.discloud.app/", { timeout: 5000 })
        .then((data): SaphireApiBotResponse => data.data)
        .catch((): null => null)

    if (req && req.status === "Online") {
        sender({
            url: env.WEBHOOK_STATUS,
            content: "📡 | Aplicação está online na host Discloud.",
            avatarURL: "https://media.discordapp.net/attachments/893361065084198954/1018699630998986752/data-management.png?width=473&height=473",
            username: "[API] Saphire Status | ONLINE"
        }).catch(() => null)

        setTimeout(() => initCheckerInterval("Discloud"), 5000)
        return;
    }

    return connect()
}

async function connect(): Promise<void> {

    sender({
        url: env.WEBHOOK_STATUS,
        content: "📡 | Solicitando religamento na Host Discloud.",
        avatarURL: "https://media.discordapp.net/attachments/893361065084198954/1018699630998986752/data-management.png?width=473&height=473",
        username: "[API] Saphire Status | OFFLINE"
    }).catch(() => null);

    await axios.put(`https://api.discloud.app/v2/app/${env.DISCLOUD_APP_ID}/start`, {}, {
        headers: {
            "api-token": env.DISCLOUD_TOKEN
        }
    })
        .then((): void => {

            sender({
                url: env.WEBHOOK_STATUS,
                content: `${dataJSON.emojis.check} | Solicitação efetuada com sucesso. Aplicação iniciando em breve.`,
                avatarURL: "https://media.discordapp.net/attachments/893361065084198954/1018699630998986752/data-management.png?width=473&height=473",
                username: "[API] Discloud Connection | START"
            }).catch(() => null);

            setTimeout(() => initCheckerInterval("Discloud"), 60000)
            return;
        })
        .catch((err): void => failedToStart(err))

    return;
}

function failedToStart(err: Error): void {

    sender({
        url: env.WEBHOOK_STATUS,
        content: `${dataJSON.emojis.deny} | Não foi possível efetuar a conexão com a Host Discloud.\nContactando Squarecloud.\n\`${err}\``,
        avatarURL: "https://media.discordapp.net/attachments/893361065084198954/1018699630998986752/data-management.png?width=473&height=473",
        username: "[API] Discloud Connection | START FAIL"
    }).catch(() => null);

    squarecloud()
    return;
}
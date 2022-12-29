import axios from "axios"
import sender from "../webhooks/sender"
import dataJSON from "../json/data.json"
import initCheckerInterval from "./index"
import discloud from "./discloud"
import { env } from "process"
import { SaphireApiBotResponse, SquareCloudStartBot } from "../@types"

export default (): void => {

    setTimeout(async (): Promise<void> => {

        const anotherCheck = await discloudCheck()

        if (anotherCheck && ["Online", "success"].includes(anotherCheck?.status)) {
            setTimeout(() => initCheckerInterval("Discloud"), 5000)
            return;
        }

        return execute()

    }, 5000)

}

async function execute(): Promise<void> {

    sender({
        url: env.WEBHOOK_STATUS,
        content: "📡 | Aplicação se encontra offline na Host Discloud. Contactando Host Squarecloud.",
        avatarURL: "https://media.discordapp.net/attachments/893361065084198954/1018699630998986752/data-management.png?width=473&height=473",
        username: "[API] Saphire Status | OFFLINE"
    }).catch(() => null)

    const req: SaphireApiBotResponse | null = await axios.get("https://bot.squareweb.app/", { timeout: 5000 })
        .then((data): SaphireApiBotResponse => data.data)
        .catch((): null => null)

    if (req && req.status === "Online") {
        sender({
            url: env.WEBHOOK_STATUS,
            content: "📡 | Aplicação se encontra online na host Squarecloud.",
            avatarURL: "https://media.discordapp.net/attachments/893361065084198954/1018699630998986752/data-management.png?width=473&height=473",
            username: "[API] Saphire Status | ONLINE"
        }).catch(() => null)

        setTimeout(() => initCheckerInterval("Squarecloud"), 5000)
        return;
    }

    return connect()
}

async function discloudCheck(): Promise<SaphireApiBotResponse | null> {

    const req: SaphireApiBotResponse | null = await axios.get("https://saphire.discloud.app/", { timeout: 5000 })
        .then((data): SaphireApiBotResponse => data.data)
        .catch((): null => null)

    return req
}

async function connect(): Promise<void> {

    sender({
        url: env.WEBHOOK_STATUS,
        content: "📡 | Solicitando religamento na Host Squarecloud.",
        avatarURL: "https://media.discordapp.net/attachments/893361065084198954/1018699630998986752/data-management.png?width=473&height=473",
        username: "[API] Saphire Status | OFFLINE"
    }).catch(() => null);

    await axios.post(`https://api.squarecloud.app/v1/public/start/${env.APP_ID}`, {}, {
        headers: {
            authorization: env.SQUARE_API_TOKEN
        }
    })
        .then((data): void => {

            const result: SquareCloudStartBot = data.data

            if (result.status !== "success")
                return

            sender({
                url: env.WEBHOOK_STATUS,
                content: `${dataJSON.emojis.check} | Solicitação efetuada com sucesso. Aplicação iniciando em breve.`,
                avatarURL: "https://media.discordapp.net/attachments/893361065084198954/1018699630998986752/data-management.png?width=473&height=473",
                username: "[API] Squarecloud Connection | START"
            }).catch(() => null);

            setTimeout(() => initCheckerInterval("Squarecloud"), 60000)
            return;
        })
        .catch((err): void => failedToStart(err))

    return;
}

function failedToStart(err: Error): void {

    sender({
        url: env.WEBHOOK_STATUS,
        content: `${dataJSON.emojis.deny} | Não foi possível efetuar a conexão com a Host Squarecloud.\nContactando Discloud.\n\`${err}\``,
        avatarURL: "https://media.discordapp.net/attachments/893361065084198954/1018699630998986752/data-management.png?width=473&height=473",
        username: "[API] Squarecloud Connection | START FAIL"
    }).catch(() => null);

    discloud()
    return;
}
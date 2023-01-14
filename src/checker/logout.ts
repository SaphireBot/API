import axios from "axios"
import { env } from "process"
import sender from "../webhooks/sender"

export default async (): Promise<void> => {

    sender({
        url: env.WEBHOOK_STATUS,
        content: "📡 | Aplicação se encontra online em mais de uma host.\n📨 | Solicitando desligamento em todas as hosts, exceto na Host Discloud.",
        avatarURL: "https://media.discordapp.net/attachments/893361065084198954/1018699630998986752/data-management.png?width=473&height=473",
        username: "[API] Saphire Status | Double Online"
    })

    const response: number | Error = await axios.post(`https://api.squarecloud.app/v1/public/stop/${env.APP_ID}`, {}, {
        headers: {
            authorization: env.SQUARE_API_TOKEN
        }
    })
        .then((res): number => res.status)
        .catch((error): Error => error)

    if (response === 200)
        return sender({
            url: env.WEBHOOK_STATUS,
            content: "📡 | Aplicação foi desligada em todas as host e mantida na Host Discloud.",
            avatarURL: "https://media.discordapp.net/attachments/893361065084198954/1018699630998986752/data-management.png?width=473&height=473",
            username: "[API] Saphire Status | Adjusted"
        })
        
    return sender({
        url: env.WEBHOOK_STATUS,
        content: "📡 | Não foi possível desligar a aplicação na Host Squarecloud.",
        embeds: [{
            color: 0xB32222,
            description: `${response}`
        }],
        avatarURL: "https://media.discordapp.net/attachments/893361065084198954/1018699630998986752/data-management.png?width=473&height=473",
        username: "[API] Saphire Status | Error to Turn Off"
    })

}
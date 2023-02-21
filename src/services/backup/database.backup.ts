import axios from "axios"
import { env } from "process"
import saveBackup from "./save.backup"
import { emojis } from "../../json/data.json"

export default async () => {

    const documentData = [
        { name: "users", url: env.ROUTE_USERS_FROM_DATABASE },
        { name: "guilds", url: env.ROUTE_GUILDS_FROM_DATABASE },
        { name: "animes", url: env.ROUTE_ANIMES_FROM_DATABASE },
        { name: "cantadas", url: env.ROUTE_CANTADAS_FROM_DATABASE },
        { name: "clients", url: env.ROUTE_CLIENTS_FROM_DATABASE },
        { name: "economies", url: env.ROUTE_ECONOMIES_FROM_DATABASE },
        { name: "fanarts", url: env.ROUTE_FANARTS_FROM_DATABASE },
        { name: "indications", url: env.ROUTE_INDICATIONS_FROM_DATABASE },
        { name: "memes", url: env.ROUTE_MEMES_FROM_DATABASE },
        { name: "rathers", url: env.ROUTE_RATHERS_FROM_DATABASE },
        { name: "reminders", url: env.ROUTE_REMINDERS_FROM_DATABASE },
    ]

    for await (const document of documentData)
        await saveBackup(document.name, document.url)

    await axios({
        url: env.WEBHOOK_STATUS,
        method: "POST",
        data: {
            content: `${emojis.check} Backup finalizado.`,
            username: "[API] Database Backup Manager"
        }
    })
        .catch(() => null)
}
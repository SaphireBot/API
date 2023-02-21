import { env } from "process"
import { save, redefine } from "./save.backup"
import { emojis } from "../../json/data.json"
import { execute, webhook, message } from "./execute.backup"

export default async (): Promise<void> => {

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
        await save(document.name, document.url)

    redefine()

    const date = new Date()
    date.setDate(date.getDate() + 1)
    date.setHours(0, 0, 0, 0)
    const midnight = date.valueOf()
    const timeRemaing = midnight - Date.now()

    if (message) {
        webhook?.editMessage(message.id, {
            content: `${emojis.check} Backup finalizado.\n📅 Próximo backup em: ${format(date)}`
        }).catch(() => null)
    }

    setTimeout(() => execute(), timeRemaing)
    return
}

function format(date: Date): string {

    return `${n(date.getDate())}/${n(date.getMonth() + 1)}/${n(date.getFullYear())} ás ${n(date.getHours())}:${n(date.getMinutes())}:${n(date.getSeconds())}`

    function n(num: number): string {
        return `${num}`.length == 1 ? `0${num}` : `${num}`
    }
}
import { SaphireApiDataResponse } from "../../@types"
import { env } from "process"
let messageId: string | undefined

export default async (webhookUrl: string): Promise<void> => {

    if (!webhookUrl) return

    check()
    const interval = setInterval(() => check(), 1000 * 60)

    async function check(): Promise<void> {

        const data = await getData()
        if (!data) return clearTimeout(interval)

        if (!messageId) return send(webhookUrl, data)
        await fetch(
            `${webhookUrl}/messages/${messageId}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    avatar_url: "https://media.discordapp.net/attachments/893361065084198954/1076924109440700547/image.png",
                    username: "API - Saphire Status Verification",
                    embeds: [{
                        color: data.status ? 0x57F287 : 0xED4245,
                        title: "🛰️ Resources Status",
                        description: data.status ? "🟢 Online" : "🔴 Offline",
                        fields: [
                            {
                                name: "📊 Contagem",
                                value: `${data.guilds} Servidores\n${data.users} Usuários\n${data.commands} Comandos\n${data.ping}ms ping\n${data.interactions} Interações Recebidas`
                            },
                            {
                                name: "⏱️ Tempo Online",
                                value: data?.uptime || "0 Segundo"
                            }
                        ]
                    }]
                })
            }
        )
            .catch(err => {
                console.log(err)
                send(webhookUrl, data)
            })
        return;
    }

}

async function send(webhookUrl: string, data: SaphireApiDataResponse) {

    await fetch(
        `${webhookUrl}?wait=true`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                avatar_url: "https://media.discordapp.net/attachments/893361065084198954/1076924109440700547/image.png",
                username: "API - Saphire Status Verification",
                embeds: [{
                    color: data.status ? 0x57F287 : 0xED4245,
                    title: "🛰️ Resources Status",
                    description: data.status ? "🟢 Online" : "🔴 Offline",
                    fields: [
                        {
                            name: "📊 Contagem",
                            value: `${data.guilds} Servidores\n${data.users} Usuários\n${data.commands} Comandos\n${data.ping}ms ping\n${data.interactions} Interações Recebidas`
                        },
                        {
                            name: "⏱️ Tempo Online",
                            value: data?.uptime || "0 Segundo"
                        }
                    ]
                }]
            })
        }
    )
        .then(async res => {
            const data = await res.json()
            messageId = data?.id
            return;
        })
}

async function getData(): Promise<SaphireApiDataResponse | null> {

    const data: SaphireApiDataResponse | null = await fetch(
        "https://saphire.one/data",
        {
            method: "GET",
            headers: {
                authorization: env.GET_DATA_AUTHORIZATION
            }
        }
    )
        .then(res => res.json())
        .catch(() => ({ status: false, guilds: 0, users: 0, commands: 0, ping: 0, interactions: 0 }))

    return data
}
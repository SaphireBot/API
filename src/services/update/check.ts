import { SaphireApiDataResponse } from "../../@types"
import { env } from "process"
import { interactions, shards } from "../../websocket/connection"
let messageId: string | undefined

export default (webhookUrl: string): void => {

    if (!webhookUrl) return

    check()
    const interval = setInterval(() => check(), 1000 * 60)

    async function check(): Promise<void> {

        const data = await getData()
        if (!data) return clearTimeout(interval)
        if (!messageId) return send(webhookUrl)
        await fetch(
            `${webhookUrl}/messages/${messageId}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    avatar_url: "https://media.discordapp.net/attachments/893361065084198954/1076924109440700547/image.png",
                    username: "API - Saphire Status Verification",
                    content: null,
                    embeds: [{
                        color: data.status ? 0x57F287 : 0xED4245,
                        title: "🛰️ Resources Status",
                        fields: [
                            {
                                name: "📊 Contagem",
                                value: `${data.commands} Comandos\n${interactions.count} Interações Recebidas\n${interactions.message} Mensagens Recebidas`
                            },
                            {
                                name: "🧩 Shards",
                                value: `${shards.size ? shards.map((status, shardId) => `${status.ready ? "🟢" : "🔴"} Shard ${shardId} | ${status.ms}ms`).join("\n") : "Nenhum dado obtido"}`
                            },
                            {
                                name: "⏱️ Tempo Online",
                                value: data?.uptime || "0 Segundo"
                            },
                            {
                                name: "🗓️ Última Atualização",
                                value: getDate()
                            }
                        ]
                    }]
                })
            }
        )
            .catch(err => {
                console.log(err)
                send(webhookUrl)
            })
        return;
    }

}

async function send(webhookUrl: string) {

    await fetch(
        `${webhookUrl}?wait=true`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                avatar_url: "https://media.discordapp.net/attachments/893361065084198954/1076924109440700547/image.png",
                username: "API - Saphire Status Verification",
                embeds: [],
                content: "Aguardando recebimento de dados..."
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

function getDate(): string {
    const date = new Date()
    return `${format(date.getHours())}:${format(date.getMinutes())} ${format(date.getDate())}/${format(date.getMonth() + 1)}/${format(date.getFullYear())}`
    function format(num: number) {
        if (num < 10) return `0${num}`
        return num
    }
}
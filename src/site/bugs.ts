import { ButtonStyle, parseEmoji } from "discord.js"
import { Request, Response } from "express"
import { messagesToSend } from "../services/message/message.post"
import { env } from "process"
import Database from "../database"

export default async (req: Request, res: Response) => {

    const { title, description, isCommandBuggued, command, userId }:
        { title: string | undefined, description: string, isCommandBuggued: boolean, command: string | undefined, userId: string } = req.body

    if (!description || !userId)
        return res.status(400).send({ message: "Descrição & ID de usuário estão faltando" });

    if (description.length > 3900)
        return res.status(400).send({ message: "O tamanho da descrição não pode ultrapassar 3900 caracteres." });

    if ((title?.length || 0) > 50)
        return res.status(400).send({ message: "O tamanho da título não pode ultrapassar 3900 caracteres." });

    if (!env.SERVER_BUG_REPORT)
        return res.status(500).send({ message: "ID do canal de origem não especificado." });

    const user = await fetch(
        `https://discord.com/api/v10/users/${userId}`,
        {
            method: "GET",
            headers: { authorization: `Bot ${env.BOT_TOKEN_REQUEST}` }
        }
    ).then(res => res.json()).catch(() => null) as any

    const userData = await Database.User.findOne({ id: userId })

    if ((userData?.Timeouts?.Bug || 0) > Date.now())
        return res.status(429).send({ type: "timeout", timestamp: (userData?.Timeouts?.Bug || 0), message: "Você não pode fazer mais reportes até" })

    await Database.User.updateOne(
        { id: userId },
        { $set: { "Timeouts.Bug": Date.now() + (1000 * 60 * 5) } },
        { upsert: true }
    )

    messagesToSend.push({
        data: {
            channelId: env.SERVER_BUG_REPORT,
            content: null,
            method: "post",
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: "Responder Reporte",
                            custom_id: JSON.stringify({ c: "report", userId }),
                            style: ButtonStyle.Primary,
                            emoji: parseEmoji("📨") as { animated: boolean, name: string, id: string },
                        },
                        {
                            type: 2,
                            label: "Deletar",
                            custom_id: JSON.stringify({ c: "delete" }),
                            style: ButtonStyle.Danger,
                        },
                    ]
                }
            ],
            embeds: [{
                color: 0xED4245,
                title: "📢 [SITE] Report de Bug/Erro Recebido",
                description: `> Reporte enviado via site\n> ${user?.username || "Not Found"} - \`${user?.id || userId}\`\n\`\`\`txt\n${description || "Nenhum dado coletado."}\n\`\`\``,
                fields: [
                    {
                        name: isCommandBuggued ? "ℹ️ | Comando reportado" : "Título do Reporte",
                        value: isCommandBuggued ? `\`${command || "Nenhum"}\`` : title ? title : "Nenhum comando ou título definido",
                    }
                ],
                timestamp: new Date().toISOString()
            }]
        }
    })

    return res.status(200).send({ message: "ok" })
}
import axios from "axios";
import { env } from "node:process";
import { server } from "../../server";
import FormData from "form-data"
import sender from "../../webhooks/sender";

server.post("/commit", async (req, res) => {

    if (req.headers.authorization !== env.COMMIT_AUTHORIZATION)
        return res
            .status(401)
            .send("Authorization is not defined correctly.");

    const discloudFileUrl = req.headers.discloud as string | null
    const apiFileUrl = req.headers.api as string | null

    if (!discloudFileUrl && !apiFileUrl)
        return res
            .status(401)
            .send("No file in any hosts.")

    if (discloudFileUrl) {

        const discloudFile = await axios.get(discloudFileUrl, { responseType: "arraybuffer" })
            .then(data => data.data)
            .catch(() => null)

        const form = new FormData()
        form.append("file", discloudFile, { filename: "file.zip" })

        discloudCommit(form)
    }

    if (apiFileUrl) {

        const apiFile = await axios.get(apiFileUrl, { responseType: "arraybuffer" })
            .then(data => data.data)
            .catch(() => null)

        const form = new FormData()
        form.append("file", apiFile, { filename: "file.zip" })

        apiCommit(form)
    }

    return res.statusCode
})

async function apiCommit(form: FormData): Promise<void> {

    sender({
        url: env.WEBHOOK_STATUS,
        content: "📡 | Inicializando commit na Host Discloud (API)",
        avatarURL: "https://media.discordapp.net/attachments/893361065084198954/1018699630998986752/data-management.png?width=473&height=473",
        username: "[API] Saphire Status | Discloud Commit Inicializing..."
    })

    axios.put(`https://api.discloud.app/v2/app/${env.SAPHIRE_API_ID}/commit`,
        form,
        {
            headers: form.getHeaders({
                "api-token": env.DISCLOUD_TOKEN
            })
        })
        .then(() => sender({
            url: env.WEBHOOK_STATUS,
            content: "📡 | Commit da API realizado com sucesso na Host Discloud, reiniciando API.",
            avatarURL: "https://media.discordapp.net/attachments/893361065084198954/1018699630998986752/data-management.png?width=473&height=473",
            username: "[API] Saphire Status | Discloud Commit Success"
        }))
        .catch(error => sender({
            url: env.WEBHOOK_STATUS,
            content: "📡 | Não foi possível realizar o commit da API na Host Discloud",
            avatarURL: "https://media.discordapp.net/attachments/893361065084198954/1018699630998986752/data-management.png?width=473&height=473",
            username: "[API] Saphire Status | Discloud Commit Error",
            embeds: [{
                color: 0xFFFFFF,
                title: "Relatório de erro",
                description: `\`\`\`txt\n${error.response.data}\n\`\`\``
            }]
        }));

}

async function discloudCommit(form: FormData): Promise<void> {

    sender({
        url: env.WEBHOOK_STATUS,
        content: "📡 | Inicializando commit na Host Discloud",
        avatarURL: "https://media.discordapp.net/attachments/893361065084198954/1018699630998986752/data-management.png?width=473&height=473",
        username: "[API] Saphire Status | Discloud Commit Inicializing..."
    })

    axios.put(`https://api.discloud.app/v2/app/${env.SAPHIRE_ID}/commit`,
        form,
        {
            headers: form.getHeaders({
                "api-token": env.DISCLOUD_TOKEN
            })
        })
        .then(() => sender({
            url: env.WEBHOOK_STATUS,
            content: "📡 | Commit realizado com sucesso na Host Discloud",
            avatarURL: "https://media.discordapp.net/attachments/893361065084198954/1018699630998986752/data-management.png?width=473&height=473",
            username: "[API] Saphire Status | Discloud Commit Success"
        }))
        .catch(error => sender({
            url: env.WEBHOOK_STATUS,
            content: "📡 | Não foi possível realizar o commit na Host Discloud",
            avatarURL: "https://media.discordapp.net/attachments/893361065084198954/1018699630998986752/data-management.png?width=473&height=473",
            username: "[API] Saphire Status | Discloud Commit Error",
            embeds: [{
                color: 0xFFFFFF,
                title: "Relatório de erro",
                description: `\`\`\`txt\n${error.response.data}\n\`\`\``
            }]
        }));

}